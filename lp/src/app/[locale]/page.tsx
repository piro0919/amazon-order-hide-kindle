import { Download, Github } from "lucide-react";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

const GITHUB_URL = "https://github.com/piro0919/amazon-order-hide-kindle";
const RELEASE_URL =
  "https://github.com/piro0919/amazon-order-hide-kindle/releases/latest";

const POINTS = ["toggle", "scope", "quiet"] as const;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: PageProps): Promise<ReactNode> {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <Image
            alt="Hide Kindle Orders"
            className="rounded-lg"
            height={28}
            priority={true}
            src="/icon.png"
            width={28}
          />
          <span className="text-sm font-semibold text-on-field">
            Hide Kindle Orders
          </span>
        </div>
        <a
          className="inline-flex items-center gap-1.5 text-sm text-on-field-dim transition-colors hover:text-lime"
          href={GITHUB_URL}
        >
          <Github size={15} strokeWidth={1.75} />
          {t("Hero.viewOnGithub")}
        </a>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pt-10 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pt-16 lg:pb-28">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-[0.25em] text-lime uppercase">
            Firefox Extension
          </p>
          <h1 className="mt-6 font-display text-4xl leading-[1.15] font-bold tracking-tight whitespace-pre-line text-on-field sm:text-5xl">
            {t("Hero.title")}
          </h1>
          <p className="mt-6 max-w-md leading-relaxed text-on-field-dim">
            {t("Hero.description")}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex items-center justify-center gap-2 bg-lime px-6 py-3.5 text-base font-semibold text-ink-1 transition-colors hover:bg-panel"
              href={RELEASE_URL}
            >
              <Download size={18} strokeWidth={2} />
              {t("Hero.download")}
            </a>
            <a
              className="inline-flex items-center justify-center gap-2 border border-hairline px-6 py-3.5 text-base font-semibold text-on-field transition-colors hover:border-lime hover:text-lime"
              href={GITHUB_URL}
            >
              <Github size={18} strokeWidth={2} />
              {t("Hero.viewOnGithub")}
            </a>
          </div>
          <p className="mt-6 font-mono text-xs text-on-field-dim">
            {t("Hero.note")}
          </p>
        </div>

        <div className="min-w-0">
          <OrderHistoryMockup
            heading={t("Mockup.heading")}
            hidden={[
              {
                date: t("Mockup.hidden1Date"),
                price: "¥792",
                title: t("Mockup.hidden1"),
              },
              {
                date: t("Mockup.hidden2Date"),
                price: "¥906",
                title: t("Mockup.hidden2"),
              },
            ]}
            kept={[
              {
                date: t("Mockup.kept1Date"),
                price: "¥3,480",
                title: t("Mockup.kept1"),
              },
              {
                date: t("Mockup.kept2Date"),
                price: "¥1,280",
                title: t("Mockup.kept2"),
              },
            ]}
            kindleLabel={t("Mockup.kindleLabel")}
            orderLabel={t("Mockup.orderLabel")}
            toggle={t("Mockup.toggle")}
          />
        </div>
      </section>

      <section className="bg-field-deep">
        <div className="mx-auto grid max-w-6xl gap-px px-6 sm:grid-cols-3">
          {POINTS.map((key, i) => (
            <div
              className="border-hairline py-12 sm:border-l sm:px-8 sm:first:border-l-0 sm:first:pl-0"
              key={key}
            >
              <span className="font-mono text-xs text-lime">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold text-on-field">
                {t(`Points.${key}.title`)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-on-field-dim">
                {t(`Points.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-10 sm:flex-row sm:justify-between">
        <span className="text-sm text-on-field-dim">
          Made by{" "}
          <a
            className="text-on-field transition-colors hover:text-lime"
            href={GITHUB_URL}
          >
            piro0919
          </a>
        </span>
        <a
          className="font-mono text-xs text-on-field-dim transition-colors hover:text-lime"
          href={GITHUB_URL}
        >
          {t("Hero.viewOnGithub")}
        </a>
      </footer>
    </main>
  );
}

type Order = {
  date: string;
  price: string;
  title: string;
};

type MockupProps = {
  heading: string;
  hidden: Order[];
  kept: Order[];
  kindleLabel: string;
  orderLabel: string;
  toggle: string;
};

function OrderHistoryMockup({
  heading,
  hidden,
  kept,
  kindleLabel,
  orderLabel,
  toggle,
}: MockupProps): ReactNode {
  return (
    <div className="mx-auto w-full max-w-md overflow-hidden bg-panel shadow-[0_30px_60px_-25px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between border-b border-panel-dim px-5 py-4">
        <p className="text-sm font-semibold text-ink-1">{heading}</p>
        <span className="bg-ink-1 px-3 py-1 font-mono text-[11px] font-semibold text-lime">
          {toggle}
        </span>
      </div>
      <div>
        {kept.map((order) => (
          <OrderRow key={order.title} order={order} orderLabel={orderLabel} />
        ))}
        {hidden.map((order, i) => (
          <div className="relative" key={order.title}>
            <OrderRow
              kindleLabel={kindleLabel}
              order={order}
              orderLabel={orderLabel}
            />
            {/* A row the extension removes. The bar runs in from the left */}
            <span
              aria-hidden="true"
              className="redaction absolute inset-x-4 inset-y-2 bg-ink-1"
              style={{ animationDelay: `${i * 260}ms` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderRow({
  kindleLabel,
  order,
  orderLabel,
}: {
  kindleLabel?: string;
  order: Order;
  orderLabel: string;
}): ReactNode {
  return (
    <div className="border-b border-panel-dim px-5 py-4 last:border-b-0">
      <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-ink-3">
        <span>
          {orderLabel} {order.date}
        </span>
        <span>{order.price}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="size-9 shrink-0 bg-panel-dim" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-ink-1">{order.title}</p>
          {kindleLabel ? (
            <p className="mt-0.5 font-mono text-[11px] text-ink-2">
              {kindleLabel}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
