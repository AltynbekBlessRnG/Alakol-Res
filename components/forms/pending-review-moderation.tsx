"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function approve() {
    setMessage("");
    setError("");
    setIsSubmitting(true);
    const response = await fetch(`/api/admin/reviews/${review.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? "Не удалось одобрить отзыв.");
      setIsSubmitting(false);
      return;
    }

    setMessage("Отзыв одобрен.");
    startTransition(() => {
      router.refresh();
    });
    setIsSubmitting(false);
  }

  return (
    <div className="rounded-[1.5rem] bg-mist p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-ink">
          {review.authorName} · {review.rating}/5
        </p>
        <p className="text-xs text-black/45">{review.resortTitle}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-black/60">{review.body}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={approve}
          disabled={isSubmitting || isPending}
          className="interactive-surface rounded-full bg-pine px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting || isPending ? "Одобряем..." : "Одобрить"}
        </button>
        {message ? <p className="text-sm text-pine">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
