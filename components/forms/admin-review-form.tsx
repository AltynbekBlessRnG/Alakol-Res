"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ModerationReview, Resort, ResortImage } from "@/lib/types";

type AdminReviewFormProps = {
  resort: Resort & {
    images: ResortImage[];
    moderationReviews: ModerationReview[];
    completeness?: { isReady: boolean; missing: string[] };
  };
};

export function AdminReviewForm({ resort }: AdminReviewFormProps) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [isFeatured, setIsFeatured] = useState(resort.isFeatured);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const openHref = resort.status === "PUBLISHED" ? `/catalog/${resort.slug}` : `/admin/resorts/${resort.id}`;

  async function updateFeatured(nextFeatured: boolean) {
    setMessage("");
    setError("");
    setIsSubmitting(true);
    const response = await fetch(`/api/admin/resorts/${resort.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "featured", featured: nextFeatured })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? "Не удалось обновить featured.");
      setIsSubmitting(false);
      return;
    }

    setIsFeatured(nextFeatured);
    setMessage(nextFeatured ? "Карточка добавлена в featured." : "Карточка убрана из featured.");
    startTransition(() => router.refresh());
    setIsSubmitting(false);
  }

  async function moderate(action: "publish" | "reject") {
    setMessage("");
    setError("");
    setIsSubmitting(true);
    const response = await fetch(`/api/admin/resorts/${resort.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "moderation", action, comment })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string; missing?: string[] } | null;
      const details = payload?.missing?.length ? ` Не хватает: ${payload.missing.join(", ")}.` : "";
      setError((payload?.message ?? "Не удалось выполнить действие.") + details);
      setIsSubmitting(false);
      return;
    }

    setMessage(action === "publish" ? "Карточка опубликована." : "Карточка отправлена на доработку.");
    startTransition(() => router.refresh());
    setIsSubmitting(false);
  }

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
          <p>
            <strong>Цена:</strong> {resort.minPrice} - {resort.maxPrice} ₸
          </p>
          <p>
            <strong>Питание:</strong> {resort.foodOptions}
          </p>
          <p>
            <strong>Тип:</strong> {resort.accommodationType}
          </p>
          <p>
            <strong>Локация:</strong> {resort.address}
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-mist p-4 text-sm leading-6 text-black/70">
          <p>
            <strong>Фото:</strong> {resort.images.length}
          </p>
          <p>
            <strong>Обновлено:</strong> {new Intl.DateTimeFormat("ru-RU").format(resort.updatedAt)}
          </p>
          <p>
            <strong>До воды:</strong> {resort.distanceToLakeM} м
          </p>
          {resort.completeness && !resort.completeness.isReady && (
            <p>
              <strong>Не хватает:</strong> {resort.completeness.missing.join(", ")}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => updateFeatured(!isFeatured)}
          disabled={isSubmitting || isPending}
          className="interactive-surface rounded-full bg-[#d6f0e4] px-4 py-2 text-sm font-medium text-pine disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting || isPending ? "Обновляем..." : isFeatured ? "Убрать из featured" : "Сделать featured"}
        </button>
        <Link
          href={openHref}
          className="interactive-surface rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-ink"
        >
          Открыть карточку
        </Link>
      </div>
      <div className="mt-6 space-y-4">
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="min-h-[110px] w-full rounded-[1.5rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none"
          placeholder="Комментарий владельцу"
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => moderate("publish")}
            disabled={isSubmitting || isPending}
            className="interactive-surface rounded-full bg-pine px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting || isPending ? "Обрабатываем..." : "Опубликовать"}
          </button>
          <button
            type="button"
            onClick={() => moderate("reject")}
            disabled={isSubmitting || isPending}
            className="interactive-surface rounded-full bg-dune px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting || isPending ? "Обрабатываем..." : "Отклонить"}
          </button>
        </div>
        {message ? <p className="text-sm text-pine">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
