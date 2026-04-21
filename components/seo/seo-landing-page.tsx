import Link from "next/link";
import { ResortCard } from "@/components/catalog/resort-card";
import type { ResortWithRelations } from "@/lib/types";

type SeoLandingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  intro: string[];
  stats: Array<{ label: string; value: string }>;
  resorts: ResortWithRelations[];
  links: Array<{ href: string; label: string; description: string }>;
};

export function SeoLandingPage({ eyebrow, title, description, intro, stats, resorts, links }: SeoLandingPageProps) {
  return (
    <main className="min-h-screen bg-[#f7f1e6] pb-20">
      <section className="bg-[linear-gradient(135deg,#132028_0%,#244b56_100%)] px-5 pb-16 pt-10 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/catalog" className="text-sm text-white/70">
            Перейти в основной каталог
          </Link>
          <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/58">{eyebrow}</p>
              <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.95] md:text-6xl">{title}</h1>
            </div>
            <p className="max-w-xl text-base leading-8 text-white/76">{description}</p>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[1.6rem] bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">{stat.label}</p>
                <p className="mt-2 font-display text-3xl">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">зачем эта страница</p>
            <h2 className="mt-4 max-w-xl font-display text-5xl leading-[0.98] text-ink">
              Здесь собраны зоны отдыха, которые подходят под конкретный сценарий выбора, а не просто общий список.
            </h2>
          </div>
          <div className="space-y-4 text-base leading-8 text-black/66">
            {intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">подходящие объекты</p>
            <h2 className="mt-3 font-display text-4xl text-ink">Подборка для этого запроса</h2>
          </div>
          <Link href="/catalog" className="text-sm text-pine">
            Смотреть весь каталог
          </Link>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {resorts.map((resort) => (
            <ResortCard key={resort.id} resort={resort} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
        <div className="rounded-[2.2rem] bg-white p-8 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
          <p className="text-xs uppercase tracking-[0.2em] text-black/40">полезно посмотреть дальше</p>
          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-[1.6rem] bg-[#f7f1e6] p-5 transition hover:bg-[#efe5d3]">
                <h3 className="font-display text-2xl text-ink">{item.label}</h3>
                <p className="mt-3 text-sm leading-6 text-black/62">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
