import { Download, Github } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

const GITHUB_URL = "https://github.com/piro0919/amazon-order-hide-kindle";
const RELEASE_URL = "https://github.com/piro0919/amazon-order-hide-kindle/releases/latest";

const POINTS = ["toggle", "infiniteScroll", "privacy"] as const;

export default function Page(): ReactNode {
  const t = useTranslations();

  return (
    <main className="min-h-dvh">
      <section className="hero-bg px-6 pt-16 pb-20">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
          <div className="fade-up text-center lg:text-left">
            <div className="mb-6 flex items-center justify-center gap-3 lg:justify-start">
              <Image
                src="/icon.png"
                alt="Hide Kindle Orders"
                width={56}
                height={56}
                className="rounded-[14px] drop-shadow-lg"
                priority={true}
              />
              <h1 className="text-3xl font-bold tracking-tight text-ink-1 sm:text-4xl">
                Hide Kindle Orders
              </h1>
            </div>
            <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-ink-2 lg:mx-0">
              {t("Hero.description")}
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href={RELEASE_URL}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-hover"
              >
                <Download size={16} strokeWidth={2} />
                {t("Hero.download")}
              </a>
              <a
                href={GITHUB_URL}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-ink-1 transition-all hover:-translate-y-0.5"
              >
                <Github size={16} strokeWidth={2} />
                {t("Hero.viewOnGithub")}
              </a>
            </div>
            <p className="mt-4 text-center text-xs text-ink-3 lg:text-left">{t("Hero.note")}</p>
          </div>

          <div className="fade-up" style={{ animationDelay: "120ms" }}>
            <OrderHistoryMockup
              heading={t("Mockup.heading")}
              toggle={t("Mockup.toggle")}
              orderLabel={t("Mockup.orderLabel")}
              kindleLabel={t("Mockup.kindleLabel")}
              kept={[
                { title: t("Mockup.kept1"), date: t("Mockup.kept1Date"), price: "¥3,480" },
                { title: t("Mockup.kept2"), date: t("Mockup.kept2Date"), price: "¥1,280" },
              ]}
              hidden={[
                { title: t("Mockup.hidden1"), date: t("Mockup.hidden1Date"), price: "¥792" },
                { title: t("Mockup.hidden2"), date: t("Mockup.hidden2Date"), price: "¥906" },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <ul className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
          {POINTS.map((key) => (
            <li key={key} className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-1.5 text-sm font-semibold text-ink-1">{t(`Points.${key}.title`)}</h2>
              <p className="text-sm leading-relaxed text-ink-2">{t(`Points.${key}.description`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between text-sm text-ink-3">
          <span>
            {t("Footer.madeBy")}{" "}
            <a href={GITHUB_URL} className="text-ink-2 transition-colors hover:text-accent">
              piro0919
            </a>
          </span>
          <a href={GITHUB_URL} className="transition-colors hover:text-accent">
            GitHub
          </a>
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
  toggle: string;
  orderLabel: string;
  kindleLabel: string;
  kept: Order[];
  hidden: Order[];
};

function OrderHistoryMockup({
  heading,
  toggle,
  orderLabel,
  kindleLabel,
  kept,
  hidden,
}: MockupProps): ReactNode {
  return (
    <div className="mockup-shell mx-auto w-full max-w-sm overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-ink-1">{heading}</p>
        <span className="rounded-full bg-brand px-3 py-1 text-[11px] font-semibold text-white">
          {toggle}
        </span>
      </div>
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
    <div className="px-4 py-3">
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-ink-3">
        <span>
          {orderLabel} {order.date}
        </span>
        <span>{order.price}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="size-8 shrink-0 rounded-md bg-border" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-ink-1">{order.title}</p>
          {kindleLabel ? (
            <p className="mt-0.5 text-[11px] font-semibold text-accent">{kindleLabel}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
