"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { createReviewAction } from "@/lib/actions";

export function ReviewForm({ resortId, returnTo }: { resortId: string; returnTo: string }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">Загружаем аккаунт…</div>;
  }

  if (session?.user.role !== "USER") {
    return (
      <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
        <p className="text-xs uppercase tracking-[0.2em] text-black/45">Отзывы</p>
        <h3 className="mt-3 font-display text-3xl text-ink">Войдите, чтобы оставить отзыв</h3>
        <p className="mt-4 text-sm leading-7 text-black/60">
          Отзывы публикуются от имени аккаунта и уходят на модерацию. Так карточки выглядят надёжнее, а впечатления гостей остаются понятными и живыми.
        </p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`${returnTo}#reviews`)}`}
          className="mt-6 inline-flex rounded-full bg-pine px-5 py-3 text-sm font-medium text-white"
        >
          Войти и оставить отзыв
        </Link>
      </div>
    );
  }

  return (
    <form action={createReviewAction} className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
      <input type="hidden" name="resortId" value={resortId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <p className="text-xs uppercase tracking-[0.2em] text-black/45">Оставить отзыв</p>
      <h3 className="mt-3 font-display text-3xl text-ink">Поделиться впечатлением</h3>
      <p className="mt-2 text-sm text-black/55">Отзыв будет опубликован от имени {session.user.name} после модерации.</p>
      <div className="mt-4 grid gap-4">
        <select name="rating" defaultValue="5" className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none">
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>{value} / 5</option>
          ))}
        </select>
        <textarea
          name="body"
          placeholder="Поделитесь впечатлением о сервисе, пляже, чистоте и удобствах"
          className="min-h-[110px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
        />
        <button className="rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">Отправить отзыв</button>
      </div>
    </form>
  );
}
