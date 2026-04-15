import { moderateReviewAction } from "@/lib/actions";

type PendingReviewModerationProps = {
  review: {
    id: string;
    authorName: string;
    rating: number;
    body: string;
    resortTitle: string;
  };
};

export function PendingReviewModeration({ review }: PendingReviewModerationProps) {
  return (
    <form action={moderateReviewAction} className="rounded-[1.5rem] bg-mist p-4">
      <input type="hidden" name="id" value={review.id} />
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-ink">{review.authorName} · {review.rating}/5</p>
        <p className="text-xs text-black/45">{review.resortTitle}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-black/60">{review.body}</p>
      <button name="status" value="approved" className="mt-4 rounded-full bg-pine px-4 py-2 text-sm text-white">
        Одобрить
      </button>
    </form>
  );
}
