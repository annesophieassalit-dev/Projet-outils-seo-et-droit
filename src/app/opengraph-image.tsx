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
          justifyContent: "space-between",
          padding: "64px 100px 56px",
          background: "linear-gradient(135deg, #3d6b5e 0%, #5a8a7a 35%, #7aaa98 60%, #5a8a7a 80%, #3d6b5e 100%)",
          position: "relative",
        }}
      >
        {/* Halo central */}
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "50%",
            width: "700px",
            height: "320px",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(ellipse, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.05) 55%, transparent 75%)",
            display: "flex",
          }}
        />

        {/* Titre haut */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
          <span
            style={{
              color: "rgba(255,255,255,0.88)",
              fontSize: "30px",
              letterSpacing: "8px",
              fontWeight: 300,
              fontFamily: "sans-serif",
            }}
          >
            VISIBLE ET
          </span>
          <span
            style={{
              color: "white",
              fontSize: "80px",
              letterSpacing: "5px",
              fontWeight: 700,
              fontFamily: "sans-serif",
              textShadow: "0 0 40px rgba(255,255,255,0.6), 0 0 80px rgba(255,255,255,0.3)",
            }}
          >
            CONFORME
          </span>
        </div>

        {/* Carte centrale */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Badge "L'outil" */}
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "8px 28px",
              marginBottom: "-6px",
              zIndex: 2,
              display: "flex",
            }}
          >
            <span
              style={{
                fontSize: "30px",
                fontWeight: 600,
                fontFamily: "sans-serif",
                color: "#a78bfa",
              }}
            >
              L&apos;outil
            </span>
          </div>

          {/* Carte principale */}
          <div
            style={{
              background: "white",
              borderRadius: "28px",
              padding: "28px 70px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
            }}
          >
            <span
              style={{
                fontSize: "68px",
                fontWeight: 700,
                color: "#1e2d5e",
                fontFamily: "sans-serif",
              }}
            >
              Visible &amp; Conforme
            </span>
          </div>
        </div>

        {/* Badge auteure */}
        <div
          style={{
            background: "rgba(20, 35, 60, 0.55)",
            borderRadius: "10px",
            padding: "8px 22px",
            display: "flex",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "22px",
              fontStyle: "italic",
              fontFamily: "sans-serif",
            }}
          >
            Anne-Sophie Assalit
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
