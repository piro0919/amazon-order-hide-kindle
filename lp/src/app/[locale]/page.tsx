import {
  BookX,
  Coffee,
  Download,
  Github,
  Infinity as InfinityIcon,
  MousePointerClick,
  Save,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

const GITHUB_URL = "https://github.com/piro0919/amazon-order-hide-kindle";
const RELEASE_URL = "https://github.com/piro0919/amazon-order-hide-kindle/releases/latest";
const COFFEE_URL = "https://buymeacoffee.com/piro0919";

const FEATURES = [
  { key: "toggle" as const, icon: MousePointerClick },
  { key: "resilient" as const, icon: Wrench },
  { key: "infiniteScroll" as const, icon: InfinityIcon },
  { key: "remembers" as const, icon: Save },
  { key: "privacy" as const, icon: ShieldCheck },
  { key: "signed" as const, icon: BookX },
];

const COMPANIONS = ["Infy Scroll", "AutoPagerize", "uAutoPagerize", "AutoPatchWork"];

export default function Page(): ReactNode {
  const t = useTranslations();

  return (
    <main className="min-h-dvh">
      {/* Hero */}
      <section className="hero-bg relative overflow-hidden px-6 pt-16 pb-24">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center lg:gap-10">
          {/* Hero copy */}
          <div className="fade-up text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-sm font-medium text-accent backdrop-blur">
              <BookX size={16} strokeWidth={1.75} />
              {t("Hero.badge")}
            </div>
            <div className="mb-6 flex items-center justify-center gap-4 lg:justify-start">
              <Image
                src="/icon.png"
                alt="Hide Kindle Orders"
                width={72}
                height={72}
                className="rounded-[18px] drop-shadow-xl"
                priority={true}
              />
              <h1 className="text-4xl font-bold tracking-tight text-ink-1 sm:text-5xl">
                Hide Kindle Orders
              </h1>
            </div>
            <p className="mb-4 text-2xl font-semibold tracking-tight text-ink-1 sm:text-3xl">
              {t("Hero.tagline")}
            </p>
            <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-ink-2 lg:mx-0">
              {t("Hero.description")}
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href={RELEASE_URL}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-xl"
              >
                <Download size={18} strokeWidth={2} />
                {t("Hero.download")}
              </a>
              <a
                href={GITHUB_URL}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-base font-semibold text-ink-1 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <Github size={18} strokeWidth={2} />
                {t("Hero.viewOnGithub")}
              </a>
            </div>
            <p className="mt-5 text-center text-xs text-ink-3 lg:text-left">{t("Hero.freeNote")}</p>
          </div>

          {/* Order history mockup */}
          <div className="fade-up" style={{ animationDelay: "120ms" }}>
            <OrderHistoryMockup
              heading={t("Hero.mockup.heading")}
              count={t("Hero.mockup.count")}
              toggle={t("Hero.mockup.toggle")}
              orderLabel={t("Hero.mockup.orderLabel")}
              kept={[
                { title: t("Hero.mockup.kept1"), date: t("Hero.mockup.kept1Date"), price: "¥3,480" },
                { title: t("Hero.mockup.kept2"), date: t("Hero.mockup.kept2Date"), price: "¥1,280" },
              ]}
              hidden={[
                { title: t("Hero.mockup.hidden1"), date: t("Hero.mockup.hidden1Date"), price: "¥792" },
                { title: t("Hero.mockup.hidden2"), date: t("Hero.mockup.hidden2Date"), price: "¥906" },
              ]}
              kindleLabel={t("Hero.mockup.kindleLabel")}
            />
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold tracking-widest text-accent uppercase">
            {t("Why.eyebrow")}
          </p>
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-ink-1 sm:text-4xl">
            {t("Why.title")}
          </h2>
          <p className="text-lg leading-relaxed text-ink-2">{t("Why.description")}</p>
        </div>
      </section>

      {/* Companions */}
      <section className="px-6 pb-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-3 text-sm font-semibold tracking-widest text-ink-3 uppercase">
            {t("Companions.title")}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-sm text-ink-2">{t("Companions.description")}</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {COMPANIONS.map((name) => (
              <span
                key={name}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-ink-1"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-sm font-semibold tracking-widest text-ink-3 uppercase">
            {t("Features.title")}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ key, icon: Icon }) => (
              <div
                key={key}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-xl bg-accent/10 p-2.5">
                  <Icon size={20} strokeWidth={1.75} className="text-accent" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-ink-1">
                  {t(`Features.${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-ink-2">{t(`Features.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Install */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-sm font-semibold tracking-widest text-ink-3 uppercase">
            {t("Install.title")}
          </h2>
          <ol className="space-y-4">
            {["step1", "step2", "step3"].map((step, index) => (
              <li
                key={step}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-ink-2">{t(`Install.${step}`)}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-center text-xs text-ink-3">{t("Install.note")}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-ink-1">{t("CTA.title")}</h2>
          <p className="mb-8 text-base text-ink-2">{t("CTA.description")}</p>
          <a
            href={RELEASE_URL}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-xl"
          >
            <Download size={18} strokeWidth={2} />
            {t("CTA.download")}
          </a>
          <p className="mt-4 text-xs text-ink-3">{t("CTA.requirement")}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <span className="text-sm text-ink-3">
            {t("Footer.madeBy")}{" "}
            <a
              href={GITHUB_URL}
              className="font-medium text-ink-2 transition-colors hover:text-accent"
            >
              piro0919
            </a>
          </span>
          <div className="flex items-center gap-5">
            <a
              href={GITHUB_URL}
              className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-accent"
            >
              <Github size={14} strokeWidth={1.75} />
              {t("Footer.openSource")}
            </a>
            <a
              href={COFFEE_URL}
              className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-accent"
            >
              <Coffee size={14} strokeWidth={1.75} />
              {t("Footer.buyMeACoffee")}
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

type Order = {
  title: string;
  date: string;
  price: string;
};

type MockupProps = {
  heading: string;
  count: string;
  toggle: string;
  orderLabel: string;
  kept: Order[];
  hidden: Order[];
  kindleLabel: string;
};

function OrderHistoryMockup({
  heading,
  count,
  toggle,
  orderLabel,
  kept,
  hidden,
  kindleLabel,
}: MockupProps): ReactNode {
  return (
    <div className="mockup-shell mx-auto w-full max-w-md overflow-hidden rounded-2xl">
      {/* Page header strip */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-ink-1">{heading}</p>
          <p className="text-xs text-ink-3">{count}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-brand px-3 py-1.5 text-[11px] font-semibold text-white">
          {toggle}
        </span>
      </div>

      {/* Order cards */}
      <div className="divide-y divide-border">
        {kept.map((order) => (
          <OrderRow key={order.title} order={order} orderLabel={orderLabel} />
        ))}
        {hidden.map((order) => (
          <div key={order.title} className="row-hiding">
            <OrderRow order={order} orderLabel={orderLabel} kindleLabel={kindleLabel} />
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderRow({
  order,
  orderLabel,
  kindleLabel,
}: {
  order: Order;
  orderLabel: string;
  kindleLabel?: string;
}): ReactNode {
  return (
    <div className="px-5 py-4">
      <div className="mb-2 flex items-center justify-between text-[11px] text-ink-3">
        <span>
          {orderLabel} {order.date}
        </span>
        <span>{order.price}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="size-9 shrink-0 rounded-md bg-border" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink-1">{order.title}</p>
          {kindleLabel ? (
            <p className="mt-0.5 text-[11px] font-semibold text-accent">{kindleLabel}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
