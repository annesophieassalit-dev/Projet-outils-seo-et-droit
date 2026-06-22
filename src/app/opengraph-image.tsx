import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Visible & Conforme — L'outil SEO et conformité pour praticiens bien-être";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "40px",
          background: "#4a7a6a",
          fontFamily: "sans-serif",
        }}
      >
        {/* Titre */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0px" }}>
          <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "28px", letterSpacing: "10px", fontWeight: 400 }}>
            VISIBLE ET
          </span>
          <span style={{ color: "white", fontSize: "96px", letterSpacing: "6px", fontWeight: 800, lineHeight: 1 }}>
            CONFORME
          </span>
        </div>

        {/* Séparateur */}
        <div style={{ width: "80px", height: "3px", background: "rgba(255,255,255,0.4)", display: "flex" }} />

        {/* Tagline */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "24px 60px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "22px", color: "#4a7a6a", fontWeight: 600, letterSpacing: "1px" }}>
            SEO · Conformité · Contenu
          </span>
          <span style={{ fontSize: "34px", color: "#1e2d5e", fontWeight: 700 }}>
            Pour praticiens bien-être
          </span>
        </div>

        {/* Auteure */}
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "20px", fontStyle: "italic" }}>
          par Anne-Sophie Assalit
        </span>
      </div>
    ),
    { ...size }
  );
}
