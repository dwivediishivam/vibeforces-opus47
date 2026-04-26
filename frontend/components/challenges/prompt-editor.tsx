"use client";

import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { getEncoding } from "js-tiktoken";
import { Button } from "@/components/ui/button";

const tokenizer = getEncoding("o200k_base");

export function PromptEditor({
  label = "Write your prompt:",
  placeholder,
  submitLabel = "Submit Prompt",
  disabled,
  locked,
  initialValue = "",
  onSubmit,
}: {
  label?: string;
  placeholder?: string;
  submitLabel?: string;
  disabled?: boolean;
  locked?: boolean;
  initialValue?: string;
  onSubmit: (value: string, tokens: number) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const tokens = useMemo(() => tokenizer.encode(value).length, [value]);

  return (
    <div className="surface-card rounded-2xl p-5">
      <div className="mb-4 text-sm text-[#cbd5e1]">{label}</div>
      <div className="overflow-hidden rounded-xl border border-[#1e293b]">
        <Editor
          height={320}
          theme={mounted ? "vs-dark" : undefined}
          language="plaintext"
          value={value}
          onChange={(next) => setValue(next ?? "")}
          options={{
            readOnly: Boolean(locked),
            minimap: { enabled: false },
            fontFamily: "JetBrains Mono",
            fontSize: 14,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
      {placeholder ? (
        <p className="mt-3 text-xs text-[#64748b]">{placeholder}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-4 text-xs font-mono-ui text-[#64748b]">
          <span>Tokens: {tokens}</span>
          <span>Chars: {value.length}</span>
        </div>
        <Button
          disabled={disabled || locked || value.trim().length === 0}
          onClick={() => onSubmit(value.trim(), tokens)}
          className="rounded-xl bg-[#7c3aed] px-5 hover:bg-[#6d28d9]"
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
