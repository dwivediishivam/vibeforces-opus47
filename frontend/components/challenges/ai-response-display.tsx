import { CodeDisplay } from "@/components/challenges/code-display";

export function AIResponseDisplay({
  title = "AI Response",
  content,
  language = "json",
}: {
  title?: string;
  content: string;
  language?: string;
}) {
  return (
    <div className="surface-card rounded-2xl p-5">
      <div className="mb-4 text-sm font-mono-ui text-[#f1f5f9]">{title}</div>
      <CodeDisplay code={content} language={language} />
    </div>
  );
}
