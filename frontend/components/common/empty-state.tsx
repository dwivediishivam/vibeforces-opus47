import { Button } from "@/components/ui/button";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="surface-card flex flex-col items-center rounded-2xl px-8 py-14 text-center">
      <div className="mb-5 text-[#334155]">{icon}</div>
      <h3 className="font-mono-ui text-lg font-semibold text-[#f1f5f9]">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm text-[#94a3b8]">{description}</p>
      {actionLabel ? (
        <Button variant="ghost" className="mt-6 border border-[#1e293b]" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
