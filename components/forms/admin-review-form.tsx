import { ModerationReview, Resort, ResortImage } from "@/lib/demo-data";
import { moderateResortAction, toggleFeaturedAction } from "@/lib/actions";

type AdminReviewFormProps = {
  resort: Resort & { images: ResortImage[]; moderationReviews: ModerationReview[]; completeness?: { isReady: boolean; missing: string[] } };
};

export function AdminReviewForm({ resort }: AdminReviewFormProps) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">{resort.zone}</p>
          <h3 className="mt-2 font-display text-3xl text-ink">{resort.title}</h3>
          <p className="mt-2 text-sm text-black/60">{resort.shortDescription}</p>
        </div>
        <div className="rounded-full bg-mist px-4 py-2 text-sm text-ink">{resort.status}</div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.5rem] bg-mist p-4 text-sm leading-6 text-black/70">
          <p><strong>Цена:</strong> {resort.minPrice} - {resort.maxPrice} ₸</p>
          <p><strong>Питание:</strong> {resort.foodOptions}</p>
          <p><strong>Тип:</strong> {resort.accommodationType}</p>
          <p><strong>Локация:</strong> {resort.address}</p>
        </div>
        <div className="rounded-[1.5rem] bg-mist p-4 text-sm leading-6 text-black/70">
          <p><strong>Фото:</strong> {resort.images.length}</p>
          <p><strong>Обновлено:</strong> {new Intl.DateTimeFormat("ru-RU").format(resort.updatedAt)}</p>
          <p><strong>До воды:</strong> {resort.distanceToLakeM} м</p>
          {resort.completeness && !resort.completeness.isReady && (
            <p><strong>Не хватает:</strong> {resort.completeness.missing.join(", ")}</p>
          )}
        </div>
      </div>
      <form action={toggleFeaturedAction} className="mt-4">
        <input type="hidden" name="id" value={resort.id} />
        <input type="hidden" name="featured" value={String(!resort.isFeatured)} />
        <button className="rounded-full bg-[#d6f0e4] px-4 py-2 text-sm font-medium text-pine">
          {resort.isFeatured ? "Убрать из featured" : "Сделать featured"}
        </button>
      </form>
      <form action={moderateResortAction} className="mt-6 space-y-4">
        <input type="hidden" name="id" value={resort.id} />
        <textarea
          name="comment"
          className="min-h-[110px] w-full rounded-[1.5rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none"
          placeholder="Комментарий владельцу"
        />
        <div className="flex flex-wrap gap-3">
          <button name="action" value="publish" className="rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">Опубликовать</button>
          <button name="action" value="reject" className="rounded-full bg-dune px-5 py-3 text-sm font-medium text-white">Отклонить</button>
        </div>
      </form>
    </div>
  );
}
