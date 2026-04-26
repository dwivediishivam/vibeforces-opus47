// Backend copy of learner-facing challenge instructions.
// Keep hidden answers/rubrics out of these strings.

export const challengeInstructions: Record<string, string> = {
  "SP-E1": `Listen carefully, then write a prompt that turns the spoken requirement into an exact coding task. Your score comes from whether the AI output satisfies the spec, not from whether your prompt sounds fancy. Include boundaries, replacement rules, output shape, language, and any formatting constraints.`,
  "SP-E2": `Convert the voice note into a complete data-processing request. A good prompt names the file, columns, grouping operation, calculation, sort order, and output format. The evaluator checks the generated code against the intended behavior, so avoid vague phrases like "summarize this CSV."`,
  "SP-M1": `Use the Plan step to capture the API contract: routes, methods, validation, storage model, error cases, and response codes. Use the Act step to ask for implementation against that plan. Do not rely on the model to infer omitted constraints from context.`,
  "SP-M2": `Use Plan to define a parsing strategy and list each supported Markdown feature. Use Act to request a self-contained implementation. The evaluator rewards prompts that preserve all stated constraints and produce maintainable code, not prompts that merely ask for "a converter."`,
  "SP-H1": `Treat this like a real backend handoff. Your Plan should cover events, state ownership, room lifecycle, edge cases, and failure handling. Your Act prompt should ask for working code that follows the plan. The score reflects coverage of the full spoken spec.`,
  "SP-H2": `Plan the scheduler before asking for code. Name the graph model, dependency handling, concurrency approach, cycle behavior, logging expectations, and final metrics. The evaluator checks whether the generated implementation behaves like the requested system.`,
  "TG-E1": `Write the shortest prompt that still causes the model to generate functionally correct code. The reference is hidden and scoring is behavior-based. You are rewarded for concise instructions that preserve required constraints.`,
  "TG-E2": `This is prompt efficiency under constraints. Your prompt should be short, but not so short that the model misses normalization or function-shape requirements. Functional equivalence matters more than matching a reference implementation.`,
  "TG-M1": `Prompt for the smallest complete data-structure implementation that satisfies the public requirements. Include method names and expected behavior. Do not waste tokens restating examples unless they remove ambiguity.`,
  "TG-M2": `A good token-golf prompt preserves behavior that is easy for models to omit: timing semantics, context, return value, and cleanup. The judge evaluates behavior, while token score rewards brevity against peers.`,
  "TG-H1": `Ask for a compact but correct cache implementation. The evaluator cares about observable get/put behavior, eviction order, capacity handling, and expected complexity. Short prompts win only when they still produce correct behavior.`,
  "TG-H2": `Prompt for a compact event utility with all required public methods and lifecycle behavior. The score rewards functional equivalence, not textual similarity. Keep the prompt tight but include the semantics that define correctness.`,
  "BF-E1": `Your job is not to ask the AI to "fix it"; your job is to demonstrate debugging precision. Identify the suspicious area, explain the failure mode, and describe the direction of the fix. The evaluator grades how specifically your prompt would guide a model to the real bug.`,
  "BF-E2": `Read the code and write a repair prompt that names the failing behavior and the logic responsible for it. You do not need to provide a full rewrite. Precise diagnosis beats broad review language.`,
  "BF-M1": `Focus on runtime behavior under concurrency. A strong bug-fix prompt names the scenario that fails, the state that becomes inconsistent, and the kind of change needed to make the code reliable.`,
  "BF-M2": `This challenge tests whether you can spot framework-specific bugs and explain them to an AI. Name the user-visible symptom, the underlying state/update issue, and the expected repair direction without rewriting unrelated code.`,
  "BF-H1": `Analyze lifecycle and cleanup behavior. A strong answer identifies where repeated operations accumulate stale resources and instructs the AI to make setup/teardown symmetrical.`,
  "BF-H2": `Reason about ordering, shared resources, and failure cases. Your prompt should explain how the program can get stuck and what invariant the fix should enforce. Vague concurrency advice receives low credit.`,
  "AP-E1": `Rank the three options from best to worst for the scenario. Score is based on practical engineering judgment: constraints, team size, operational load, reversibility, and time-to-ship. Do not rank by hype or theoretical scale alone.`,
  "AP-E2": `Choose the ordering that best fits a small product team building a maintainable admin experience. Evaluate implementation effort, long-term maintenance, user needs, and risk.`,
  "AP-M1": `Rank the API approaches by fit for the described product, not by personal preference. Consider client needs, schema evolution, debugging, team familiarity, and migration cost.`,
  "AP-M2": `Rank caching strategies by the actual read/write pattern and acceptable staleness. Good architecture judgment balances performance, correctness, operational complexity, and failure modes.`,
  "AP-H1": `Evaluate service-boundary choices through reversibility, ownership, data coupling, deployment risk, and incremental migration. The best option is usually the one that reduces risk while preserving future flexibility.`,
  "AP-H2": `Rank multi-region designs by consistency needs, latency, failure tolerance, data ownership, and operational maturity. Do not assume the most complex architecture is best.`,
  "UR-E1": `Study the screenshot and write one prompt for self-contained HTML/CSS. Describe layout, dimensions, spacing, color, border radius, typography hierarchy, and visual states. The evaluator compares rendered screenshots.`,
  "UR-E2": `Prompt for the exact small UI shown, not a generic form. Count visible elements, describe alignment, labels, input styles, CTA hierarchy, and background treatment.`,
  "UR-M1": `Describe the navigation from left to right, including logo treatment, link grouping, spacing, active/CTA state, and responsive expectations. Layout match is weighted heavily.`,
  "UR-M2": `Write a prompt that captures section structure first, then card details. Include grid columns, gaps, card hierarchy, text sizes, icon/image treatment, and CTA placement.`,
  "UR-H1": `For a full hero page, organize the prompt top-down: page background, nav, hero copy, CTAs, visual accents, spacing, and responsive behavior. Avoid generic adjectives unless paired with concrete visual details.`,
  "UR-H2": `For a dashboard screenshot, define the page regions before styling: sidebar, header, stats, main content, tables/cards, and spacing. The score rewards structural accuracy before pixel polish.`,
};

export function instructionsFor(code: string): string | null {
  return challengeInstructions[code] ?? null;
}
