import { ImageResponse } from "next/og";

export const alt = "Body By U — Train Anywhere";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(circle at 75% 20%, #245264 0, #111827 40%, #09090b 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ color: "#6eb2cc", fontSize: 28, fontWeight: 700 }}>
          MYANMAR&apos;S FITNESS PLATFORM
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: -3,
          }}
        >
          Body By U
        </div>
        <div style={{ display: "flex", marginTop: 18, fontSize: 36 }}>
          Train anywhere. Get stronger every week.
        </div>
      </div>
    ),
    size,
  );
}
