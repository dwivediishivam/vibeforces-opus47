import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background:
            "radial-gradient(circle at top left, rgba(124,58,237,0.28), transparent 36%), linear-gradient(135deg, #030712, #0a0f1e 60%, #111827)",
          color: "#f1f5f9",
        }}
      >
        <div style={{ display: "flex", gap: 4, fontSize: 76, fontWeight: 800 }}>
          <span>Vibe</span>
          <span style={{ color: "#a78bfa" }}>Forces</span>
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 28,
            color: "#94a3b8",
            fontFamily: "Inter",
          }}
        >
          LeetCode for Vibecoders
        </div>
        <div
          style={{
            marginTop: 56,
            fontSize: 42,
            fontFamily: "JetBrains Mono",
          }}
        >
          Train Your Prompt Instincts.
        </div>
      </div>
    ),
    size,
  );
}
