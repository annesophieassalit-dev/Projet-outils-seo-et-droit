import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#2f5e4e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "sans-serif",
            lineHeight: 1,
            letterSpacing: "-1px",
          }}
        >
          V
        </div>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#e86870",
            position: "absolute",
            bottom: 6,
            right: 6,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
