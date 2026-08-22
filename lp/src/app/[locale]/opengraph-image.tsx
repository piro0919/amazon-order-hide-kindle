import { ImageResponse } from "next/og";

export const alt = "Hide Kindle Orders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FIELD = "#10352a";
const LIME = "#c2f04f";
const PANEL = "#f3f6f0";
const PANEL_DIM = "#e2eadc";
const INK = "#0b1d17";

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ImageResponse> {
  const { locale } = await params;
  const isJa = locale === "ja";

  const rows = isJa
    ? [
        { hidden: false, price: "¥3,480", title: "メカニカルキーボード" },
        { hidden: false, price: "¥1,280", title: "コーヒー豆 500g" },
        { hidden: true, price: "¥792", title: "" },
        { hidden: true, price: "¥906", title: "" },
      ]
    : [
        { hidden: false, price: "¥3,480", title: "Mechanical keyboard" },
        { hidden: false, price: "¥1,280", title: "Coffee beans, 500g" },
        { hidden: true, price: "¥792", title: "" },
        { hidden: true, price: "¥906", title: "" },
      ];

  return new ImageResponse(
    <div style={{ background: FIELD, display: "flex", height: "100%", width: "100%" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 60px",
          width: 660,
        }}
      >
        <div style={{ color: LIME, fontSize: 20, letterSpacing: 6 }}>
          FIREFOX EXTENSION
        </div>
        <div
          style={{
            color: PANEL,
            display: "flex",
            flexDirection: "column",
            fontSize: 44,
            fontWeight: 700,
            lineHeight: 1.25,
            marginTop: 26,
          }}
        >
          {(isJa
            ? ["Kindle の注文だけ、", "履歴から消しておく。"]
            : ["Keep Kindle orders", "out of your history."]
          ).map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
        <div
          style={{
            color: "rgba(243,246,240,0.66)",
            fontSize: 24,
            marginTop: 30,
          }}
        >
          {isJa
            ? "無料 · MIT ライセンス · Firefox 115 以降"
            : "Free · MIT licensed · Firefox 115+"}
        </div>
      </div>

      <div style={{ alignItems: "center", display: "flex", width: 540 }}>
        <div
          style={{
            background: PANEL,
            display: "flex",
            flexDirection: "column",
            width: 500,
          }}
        >
          <div
            style={{
              alignItems: "center",
              borderBottom: `2px solid ${PANEL_DIM}`,
              display: "flex",
              justifyContent: "space-between",
              padding: "20px 24px",
            }}
          >
            <div style={{ color: INK, fontSize: 22, fontWeight: 600 }}>
              {isJa ? "注文履歴" : "Order history"}
            </div>
            <div
              style={{
                background: INK,
                color: LIME,
                fontSize: 16,
                padding: "6px 12px",
              }}
            >
              Hide Kindle: On
            </div>
          </div>
          {rows.map((row) => (
            <div
              key={row.price}
              style={{
                borderBottom: `2px solid ${PANEL_DIM}`,
                display: "flex",
                flexDirection: "column",
                padding: "18px 24px",
              }}
            >
              <div
                style={{
                  color: "#8a998f",
                  display: "flex",
                  fontSize: 15,
                  justifyContent: "flex-end",
                }}
              >
                {row.price}
              </div>
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  gap: 14,
                  marginTop: 8,
                }}
              >
                {row.hidden ? (
                  <div style={{ background: INK, height: 34, width: 320 }} />
                ) : (
                  <>
                    <div
                      style={{ background: PANEL_DIM, height: 34, width: 34 }}
                    />
                    <div style={{ color: INK, fontSize: 20 }}>{row.title}</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    { ...size },
  );
}
