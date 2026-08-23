import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { routing } from "@/i18n/routing";

export const alt = "Hide Kindle Orders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* ビルド時に焼く。動的なままだと public/ が関数側に含まれず、
   本番で icon.png を読めずに 500 になる */
export function generateStaticParams(): { locale: string }[] {
  return routing.locales.map((locale) => ({ locale }));
}

/* 出るのは kk-web の一覧で176px、X のカードで500px 前後。
   その大きさで残るのはアイコンと名前と1行だけ。色はアイコンから取る */
const FIELD = "#232f3e";
const PAPER = "#f4f6f8";
const ORANGE = "#ff9900";

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ImageResponse> {
  const { locale } = await params;
  const isJa = locale === "ja";
  /* 見出しの書体はサイトと同じ BIZ UDPGothic。使う文字だけに絞ったものを
     同梱している。文言を変えたら assets/README.md の手順で作り直す */
  const [icon, font] = await Promise.all([
    readFile(join(process.cwd(), "public/icon.png")),
    readFile(join(process.cwd(), "assets/BIZUDPGothic-Bold-subset.ttf")),
  ]);
  const iconSrc = `data:image/png;base64,${icon.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: FIELD,
        display: "flex",
        gap: 60,
        height: "100%",
        padding: "0 84px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            color: PAPER,
            display: "flex",
            flexDirection: "column",
            fontSize: 78,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.15,
          }}
        >
          <div>Hide Kindle</div>
          <div>Orders</div>
        </div>
        <div style={{ color: ORANGE, display: "flex", fontSize: 34, marginTop: 20 }}>
          {isJa
            ? "注文履歴から Kindle だけ消す"
            : "Keep Kindle orders out of your history"}
        </div>
      </div>
      {/* biome-ignore lint/performance/noImgElement: next/image is not available in ImageResponse */}
      <img alt="" height={280} src={iconSrc} width={280} />
    </div>,
    {
      ...size,
      fonts: [
        { data: font, name: "BIZ UDPGothic", style: "normal", weight: 700 },
      ],
    },
  );
}
