import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { noIndexMetadata } from "@/lib/seo";
import { requireRole } from "@/lib/session";
import { listUserFavoriteResortsFromSupabase, listUserReviewsFromSupabase } from "@/lib/supabase/data";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = noIndexMetadata("Мой аккаунт", "Личный раздел пользователя с избранным и отзывами.");

export default async function AccountPage() {
  const session = await requireRole("USER");
  const favorites = await listUserFavoriteResortsFromSupabase(session.user.id);
  const reviews = await listUserReviewsFromSupabase(session.user.id);

  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">аккаунт</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] text-ink md:text-6xl">
              {session.user.name}, ваш аккаунт
            </h1>
          </div>
          <p className="max-w-2xl text-base leading-8 text-black/64">
            Избранное и отзывы в одном месте.
          </p>
        </div>

        <section className="mt-10 rounded-[2rem] bg-white p-8 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/40">Избранное</p>
              <h2 className="mt-3 font-display text-3xl text-ink">Сохранённые зоны отдыха</h2>
            </div>
            <Link href="/favorites" className="rounded-full border border-black/10 px-4 py-3 text-sm font-medium text-ink">
              Открыть избранное
            </Link>
          </div>
          {!favorites.length ? (
            <p className="mt-5 text-sm leading-7 text-black/60">
              Пока здесь пусто. Когда сохраните понравившуюся зону отдыха, она появится в аккаунте и останется привязанной к вашему профилю.
            </p>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {favorites.map((resort) => (
                <Link key={resort.id} href={`/catalog/${resort.slug}`} className="overflow-hidden rounded-[1.5rem] bg-[#f7f1e6] transition hover:-translate-y-1">
                  <div className="relative h-48">
                    {resort.images[0] && <Image src={resort.images[0].url} alt={resort.images[0].alt} fill className="object-cover" />}
                  </div>
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-black/40">{resort.zone}</p>
                    <h3 className="mt-2 text-xl font-medium text-ink">{resort.title}</h3>
                    <p className="mt-3 text-sm text-black/60">от {formatPrice(resort.minPrice)} ₸ · {resort.distanceToLakeM} м до воды</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-8 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
          <p className="text-xs uppercase tracking-[0.2em] text-black/40">Отзывы</p>
          <h2 className="mt-3 font-display text-3xl text-ink">Ваши отзывы</h2>
          {!reviews.length ? (
            <p className="mt-5 text-sm leading-7 text-black/60">
              Пока отзывов нет. После отдыха можно открыть карточку зоны и оставить впечатление от сервиса, пляжа и условий проживания.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-[1.5rem] bg-[#f7f1e6] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <Link href={`/catalog/${review.resort.slug}`} className="font-medium text-ink underline decoration-black/15 underline-offset-4">
                      {review.resort.title}
                    </Link>
                    <span className="text-sm text-black/55">{review.rating}/5</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-black/68">{review.body}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-black/38">
                      {review.status === "approved" ? "Опубликован" : "Сохранён"}
                    </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
