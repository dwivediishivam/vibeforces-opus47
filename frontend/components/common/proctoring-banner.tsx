import { Lock } from "lucide-react";

export function ProctoringBanner() {
  return (
    <div className="surface-subtle flex items-start gap-3 rounded-xl border-dashed p-4 text-sm text-[#94a3b8]">
      <Lock className="mt-0.5 size-4 text-[#64748b]" />
      <div>
        <div className="font-mono-ui text-sm text-[#f1f5f9]">
          Proctoring — Coming Soon
        </div>
        <p>
          Full proctoring with tab-switch detection, screen recording, and
          AI-powered anomaly detection will be available in a future update.
        </p>
      </div>
    </div>
  );
}
