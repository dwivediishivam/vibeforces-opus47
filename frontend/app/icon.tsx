import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 192,
  height: 192,
};

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#030712",
          borderRadius: 48,
          border: "6px solid #1e293b",
          color: "#f1f5f9",
          fontFamily: "JetBrains Mono",
          fontSize: 72,
          fontWeight: 800,
          position: "relative",
        }}
      >
        <span>V</span>
        <span style={{ color: "#a78bfa" }}>F</span>
      </div>
    ),
    size,
  );
}
