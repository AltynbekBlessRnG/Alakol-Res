import { createReviewAction } from "@/lib/actions";

export function ReviewForm({ resortId }: { resortId: string }) {
  return (
    <form action={createReviewAction} className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
      <input type="hidden" name="resortId" value={resortId} />
      <p className="text-xs uppercase tracking-[0.2em] text-black/45">Оставить отзыв</p>
      <h3 className="mt-3 font-display text-3xl text-ink">Поделиться впечатлением</h3>
      <div className="mt-4 grid gap-4">
        <input name="authorName" placeholder="Ваше имя" className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none" />
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
