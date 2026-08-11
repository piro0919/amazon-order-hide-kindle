import { ImageResponse } from "next/og";

export const alt = "Hide Kindle Orders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ImageResponse> {
  const { locale } = await params;
  const isJa = locale === "ja";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #232f3e 0%, #0f1620 60%, #3a2a10 100%)",
        gap: 24,
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: next/image not available in ImageResponse */}
      <img
        alt="Hide Kindle Orders"
        src="https://hide-kindle-orders.kkweb.io/icon.png"
        width={160}
        height={160}
        style={{ borderRadius: 32 }}
      />
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "-1px",
        }}
      >
        Hide Kindle Orders
      </div>
      <div
        style={{
          fontSize: 28,
          color: "rgba(255,255,255,0.85)",
          maxWidth: 700,
          textAlign: "center",
        }}
      >
        {isJa
          ? "注文履歴から Kindle の注文を隠す Firefox 拡張機能。"
          : "A Firefox extension that hides Kindle orders on Amazon.co.jp."}
      </div>
    </div>,
    { ...size },
  );
}
