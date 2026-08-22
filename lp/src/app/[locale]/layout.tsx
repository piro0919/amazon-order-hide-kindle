import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono, BIZ_UDPGothic } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { routing } from "@/i18n/routing";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

/* 見出しの書体。帳票に使われる UD ゴシックを当てて、注文履歴の話と揃える。
   日本語は unicode-range で百件以上に割れるので preload は切る。
   切らないと使わない範囲まで先読みして 1ページで 1.5MB 取りに行く */
const displayFont = BIZ_UDPGothic({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "700"],
});

export function generateStaticParams(): { locale: string }[] {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const url = "https://hide-kindle-orders.kkweb.io";

  return {
    description: t("description"),
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
    },
    metadataBase: new URL(url),
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      type: "website",
      siteName: "Hide Kindle Orders",
      title: t("title"),
      description: t("description"),
      url,
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    alternates: {
      canonical: url,
      languages: {
        en: `${url}/en`,
        ja: `${url}/ja`,
      },
    },
  };
}

type RootLayoutProps = Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>;

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps): Promise<ReactNode> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // without this the page opts into dynamic rendering, and next-sitemap
  // ends up with no routes to list
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <body className={`${geistSans.variable} ${geistMono.variable} ${displayFont.variable} antialiased`}>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
