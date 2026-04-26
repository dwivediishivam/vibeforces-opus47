"use client";

import Editor from "@monaco-editor/react";

export function CodeDisplay({
  code,
  language = "plaintext",
  readOnly = true,
  minHeight = 260,
}: {
  code: string;
  language?: string;
  readOnly?: boolean;
  minHeight?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#1e293b]">
      <Editor
        height={minHeight}
        theme="vs-dark"
        language={language}
        value={code}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontFamily: "JetBrains Mono",
          fontSize: 14,
          lineNumbersMinChars: 3,
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}
