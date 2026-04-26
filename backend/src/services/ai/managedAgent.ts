import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "./anthropic";

/**
 * Thin orchestration layer over Claude Managed Agents.
 *
 * Mental model:
 *  - One environment is provisioned per process (cached).
 *  - One agent per challenge "kind" is created on first use and cached by a
 *    stable key (e.g. "distributed_debug", "system_design_build:hard"). Agents
 *    are persistent versioned objects — they MUST NOT be created per request.
 *  - A run is a single session against the cached agent. The caller supplies
 *    resources (file or github_repository), a kickoff message, and a custom
 *    tool dispatch table. We stream the SSE event log, dispatch tool calls,
 *    enforce a task budget, and return a structured trace.
 *
 * The trace is the grading substrate for SDE2+ challenges — it contains every
 * tool call, every custom-tool invocation, the final assistant text, file
 * outputs written under /mnt/session/outputs, and aggregate token usage.
 */

const MA_BETA = "managed-agents-2026-04-01" as const;
const TASK_BUDGET_BETA = "task-budgets-2026-03-13" as const;

export interface CustomToolSpec {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface CustomToolHandler {
  (input: unknown, ctx: { eventId: string; toolName: string }):
    | Promise<{ content: string; isError?: boolean }>
    | { content: string; isError?: boolean };
}

export interface AgentTemplate {
  /** Stable cache key — same key always resolves to the same agent. */
  key: string;
  name: string;
  systemPrompt: string;
  /** Custom tool surface the candidate's prompt or our grading harness uses. */
  customTools: CustomToolSpec[];
  /** Whether to enable the prebuilt agent toolset (bash/read/write/etc). */
  enableAgentToolset?: boolean;
  model?: string;
}

export interface SessionResource {
  type: "file" | "github_repository";
  // file
  file_id?: string;
  // github_repository
  url?: string;
  authorization_token?: string;
  branch?: string;
  // both
  mount_path?: string;
}

export interface RunOptions {
  template: AgentTemplate;
  resources?: SessionResource[];
  kickoffMessage: string;
  taskBudgetTokens: number;
  /** Hard cap on stream iterations to defend against runaway sessions. */
  maxIterations?: number;
  customToolDispatch: Record<string, CustomToolHandler>;
}

export interface ToolCallRecord {
  event_id: string;
  type: "agent_tool" | "custom_tool" | "mcp_tool";
  name: string;
  input?: unknown;
  result_preview?: string;
  is_error?: boolean;
}

export interface AgentTraceFile {
  file_id: string;
  filename: string;
  size_bytes: number;
}

export interface AgentTrace {
  session_id: string;
  agent_id: string;
  agent_version?: number | string;
  final_text: string;
  tool_calls: ToolCallRecord[];
  custom_tool_invocations: Array<{
    name: string;
    input: unknown;
    timestamp: string;
  }>;
  output_files: AgentTraceFile[];
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens: number;
    cache_creation_input_tokens: number;
  };
  stopped_because: "end_turn" | "terminated" | "budget_exceeded" | "max_iterations" | "retries_exhausted" | "unknown";
  status_history: string[];
}

const agentCache = new Map<string, { id: string; version: number | string }>();
let environmentIdPromise: Promise<string> | null = null;

function requireClient(): Anthropic {
  if (!anthropic) throw new Error("Anthropic client is not configured (ANTHROPIC_API_KEY missing).");
  return anthropic;
}

/**
 * One environment per process. Reusing across challenge runs is fine —
 * environments are templates, not allocators; sessions get fresh containers.
 */
export async function getOrCreateEnvironment(): Promise<string> {
  if (environmentIdPromise) return environmentIdPromise;
  environmentIdPromise = (async () => {
    const client = requireClient();
    const name = `vibeforces-sde2-${process.env.NODE_ENV ?? "dev"}`;

    // Try to reuse by name.
    const list = await (client as any).beta.environments.list({ betas: [MA_BETA] });
    const existing = (list?.data ?? []).find((e: any) => e.name === name && !e.archived_at);
    if (existing?.id) return existing.id as string;

    const env = await (client as any).beta.environments.create({
      name,
      config: {
        type: "cloud",
        // Open egress so candidates' code can install packages & run integration tests.
        // Tighten to package_managers_and_custom + allowed_hosts in prod if needed.
        networking: { type: "unrestricted" },
      },
      betas: [MA_BETA],
    });
    return env.id as string;
  })();
  return environmentIdPromise;
}

export async function getOrCreateAgent(template: AgentTemplate): Promise<{
  id: string;
  version: number | string;
}> {
  const cached = agentCache.get(template.key);
  if (cached) return cached;

  const client = requireClient();
  const tools: any[] = [];
  if (template.enableAgentToolset !== false) {
    tools.push({ type: "agent_toolset_20260401", default_config: { enabled: true } });
  }
  for (const tool of template.customTools) {
    tools.push({
      type: "custom",
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema,
    });
  }

  const agent = await (client as any).beta.agents.create({
    name: `vibeforces:${template.key}`,
    model: template.model ?? "claude-sonnet-4-6",
    system: template.systemPrompt,
    tools,
    betas: [MA_BETA],
  });

  const record = { id: agent.id as string, version: agent.version as number | string };
  agentCache.set(template.key, record);
  return record;
}

/**
 * Run a session to completion (or until the task budget / iteration cap kicks in).
 * Returns a fully-populated trace ready to feed into a judge.
 */
export async function runAgentSession(opts: RunOptions): Promise<AgentTrace> {
  const client = requireClient();
  const [environmentId, agent] = await Promise.all([
    getOrCreateEnvironment(),
    getOrCreateAgent(opts.template),
  ]);

  // Create the session with task_budget enforced by the model.
  const session = await (client as any).beta.sessions.create({
    agent: { type: "agent", id: agent.id, version: agent.version },
    environment_id: environmentId,
    resources: opts.resources ?? [],
    output_config: { task_budget: { type: "tokens", total: opts.taskBudgetTokens } },
    betas: [MA_BETA, TASK_BUDGET_BETA],
  });

  const sessionId = session.id as string;

  const trace: AgentTrace = {
    session_id: sessionId,
    agent_id: agent.id,
    agent_version: agent.version,
    final_text: "",
    tool_calls: [],
    custom_tool_invocations: [],
    output_files: [],
    usage: {
      input_tokens: 0,
      output_tokens: 0,
      cache_read_input_tokens: 0,
      cache_creation_input_tokens: 0,
    },
    stopped_because: "unknown",
    status_history: [],
  };

  // Open stream BEFORE sending kickoff — otherwise we miss early events.
  const stream = await (client as any).beta.sessions.events.stream(sessionId, {
    betas: [MA_BETA],
  });

  await (client as any).beta.sessions.events.send(sessionId, {
    events: [
      {
        type: "user.message",
        content: [{ type: "text", text: opts.kickoffMessage }],
      },
    ],
    betas: [MA_BETA],
  });

  const maxIterations = opts.maxIterations ?? 200;
  let iter = 0;

  for await (const event of stream as AsyncIterable<any>) {
    iter += 1;
    if (iter > maxIterations) {
      trace.stopped_because = "max_iterations";
      break;
    }

    switch (event.type) {
      case "agent.message": {
        const text = (event.content ?? [])
          .filter((b: any) => b.type === "text")
          .map((b: any) => String(b.text ?? ""))
          .join("");
        trace.final_text += text;
        break;
      }

      case "agent.tool_use":
      case "agent.mcp_tool_use": {
        trace.tool_calls.push({
          event_id: String(event.id ?? ""),
          type: event.type === "agent.mcp_tool_use" ? "mcp_tool" : "agent_tool",
          name: String(event.tool_name ?? event.name ?? ""),
          input: event.input,
        });
        break;
      }

      case "agent.tool_result":
      case "agent.mcp_tool_result": {
        const last = trace.tool_calls[trace.tool_calls.length - 1];
        if (last) {
          const preview = (event.content ?? [])
            .filter((b: any) => b.type === "text")
            .map((b: any) => String(b.text ?? ""))
            .join("")
            .slice(0, 500);
          last.result_preview = preview;
          last.is_error = Boolean(event.is_error);
        }
        break;
      }

      case "agent.custom_tool_use": {
        const toolName = String(event.tool_name ?? event.name ?? "");
        const eventId = String(event.id ?? "");
        const handler = opts.customToolDispatch[toolName];

        trace.tool_calls.push({
          event_id: eventId,
          type: "custom_tool",
          name: toolName,
          input: event.input,
        });
        trace.custom_tool_invocations.push({
          name: toolName,
          input: event.input,
          timestamp: new Date().toISOString(),
        });

        let resultText: string;
        let isError = false;
        if (!handler) {
          resultText = `No handler registered for custom tool '${toolName}'.`;
          isError = true;
        } else {
          try {
            const handlerResult = await handler(event.input, {
              eventId,
              toolName,
            });
            resultText = handlerResult.content;
            isError = Boolean(handlerResult.isError);
          } catch (err: any) {
            resultText = `Tool handler threw: ${err?.message ?? String(err)}`;
            isError = true;
          }
        }

        await (client as any).beta.sessions.events.send(sessionId, {
          events: [
            {
              type: "user.custom_tool_result",
              custom_tool_use_id: eventId,
              content: [{ type: "text", text: resultText }],
              is_error: isError,
            },
          ],
          betas: [MA_BETA],
        });
        break;
      }

      case "span.model_request_end": {
        const u = event.model_usage ?? {};
        trace.usage.input_tokens += Number(u.input_tokens ?? 0);
        trace.usage.output_tokens += Number(u.output_tokens ?? 0);
        trace.usage.cache_read_input_tokens += Number(u.cache_read_input_tokens ?? 0);
        trace.usage.cache_creation_input_tokens += Number(u.cache_creation_input_tokens ?? 0);
        break;
      }

      case "session.status_running":
      case "session.status_rescheduled": {
        trace.status_history.push(String(event.type));
        break;
      }

      case "session.status_idle": {
        trace.status_history.push("session.status_idle");
        const stopType = String(event.stop_reason?.type ?? "");
        // requires_action means we owe the agent something — keep streaming.
        if (stopType === "requires_action") break;
        if (stopType === "retries_exhausted") {
          trace.stopped_because = "retries_exhausted";
          // fall through — stream will close, exit the for-await
        } else if (stopType === "end_turn") {
          trace.stopped_because = "end_turn";
        }
        break;
      }

      case "session.status_terminated": {
        trace.status_history.push("session.status_terminated");
        trace.stopped_because = "terminated";
        break;
      }

      default:
        break;
    }

    if (
      trace.stopped_because === "end_turn" ||
      trace.stopped_because === "retries_exhausted" ||
      trace.stopped_because === "terminated"
    ) {
      break;
    }

    // Defensive budget check — task_budget is a soft signal to the model;
    // we additionally hard-cap so a runaway prompt can't burn through.
    const consumed = trace.usage.input_tokens + trace.usage.output_tokens;
    if (consumed >= opts.taskBudgetTokens * 1.25) {
      trace.stopped_because = "budget_exceeded";
      break;
    }
  }

  // Collect output files written to /mnt/session/outputs (post-idle indexing
  // lag of 1-3s; one quick retry is enough in practice).
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const files = await (client as any).beta.files.list({
        scope_id: sessionId,
        betas: [MA_BETA],
      });
      const data = files?.data ?? [];
      if (data.length > 0 || attempt === 2) {
        trace.output_files = data.map((f: any) => ({
          file_id: String(f.id),
          filename: String(f.filename ?? ""),
          size_bytes: Number(f.size_bytes ?? 0),
        }));
        break;
      }
    } catch {
      // ignore — output collection is best-effort
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  // Best-effort archive — frees the container. Brief poll because the SSE
  // idle event slightly precedes the queryable status flip.
  try {
    for (let i = 0; i < 5; i += 1) {
      const s = await (client as any).beta.sessions.retrieve(sessionId, { betas: [MA_BETA] });
      if (s?.status !== "running") break;
      await new Promise((r) => setTimeout(r, 300));
    }
    await (client as any).beta.sessions.archive(sessionId, { betas: [MA_BETA] });
  } catch {
    /* swallow */
  }

  return trace;
}

/**
 * Reset cached agents/environment. Useful for tests and for picking up
 * config changes without restarting the process.
 */
export function resetManagedAgentCaches() {
  agentCache.clear();
  environmentIdPromise = null;
}
