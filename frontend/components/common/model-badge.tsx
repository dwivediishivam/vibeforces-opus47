import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ModelBadge() {
  return (
    <div className="surface-subtle inline-flex items-center gap-2 rounded-lg px-3 py-2">
      <div className="space-y-0.5">
        <div className="text-[11px] text-[#64748b]">Currently:</div>
        <div className="font-mono-ui text-sm font-semibold text-[#a78bfa]">
          GPT-4.1
        </div>
      </div>
      <Tooltip>
        <TooltipTrigger>
          <Info className="size-4 text-[#64748b]" />
        </TooltipTrigger>
        <TooltipContent className="max-w-64 border-[#1e293b] bg-[#0a0f1e] text-[#94a3b8]">
          All prompts are executed by this model. More AI models are coming soon.
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
