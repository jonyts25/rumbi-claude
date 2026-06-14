import { ImageResponse } from "next/og";

export const alt = "Rumbi · Tu camión no trae GPS, te tiene a ti";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0d1117",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              backgroundColor: "#00d8a0",
              color: "#0d1117",
              fontSize: "44px",
              fontWeight: 900,
            }}
          >
            R
          </div>
          <div style={{ display: "flex", color: "#9aa4b2", fontSize: "30px" }}>
            Rumbi · transporte en vivo, comunitario
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              color: "#ffffff",
              fontSize: "78px",
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            Tu camión no trae GPS.
          </div>
          <div
            style={{
              display: "flex",
              color: "#00d8a0",
              fontSize: "78px",
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            Te tiene a ti.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            color: "#c9d1d9",
            fontSize: "32px",
            maxWidth: "900px",
          }}
        >
          Mira dónde viene y qué tan lleno va, en vivo. Decide si corres, esperas
          o cambias de plan.
        </div>
      </div>
    ),
    { ...size }
  );
}
