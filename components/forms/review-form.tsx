"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function ReviewForm({ resortId, returnTo, embedded = false }: { resortId: string; returnTo: string; embedded?: boolean }) {
  const { data: session, status } = useSession();
  const [rating, setRating] = useState("5");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "loading") {
    return <div className={embedded ? "" : "rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]"}>Загружаем аккаунт…</div>;
  }

  if (session?.user.role !== "USER") {
    return (
      <div className={embedded ? "" : "rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]"}>
        {!embedded && <p className="text-xs uppercase tracking-[0.2em] text-black/45">Отзывы</p>}
        <h3 className={`${embedded ? "font-display text-2xl text-ink" : "mt-3 font-display text-3xl text-ink"}`}>Войдите, чтобы оставить отзыв</h3>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`${returnTo}#reviews`)}`}
          className="mt-6 inline-flex rounded-full bg-pine px-5 py-3 text-sm font-medium text-white"
        >
          Войти и оставить отзыв
        </Link>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const nextBody = body.trim();
    const nextRating = Number(rating);

    if (!nextBody || nextRating < 1 || nextRating > 5) {
      const nextError = "Заполните текст отзыва и выберите корректную оценку.";
      setError(nextError);
      toast.error(nextError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resortId, rating: nextRating, body: nextBody })
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        const nextError = payload.message || "Не удалось отправить отзыв.";
        setError(nextError);
        toast.error(nextError);
        setIsSubmitting(false);
        return;
      }

      setBody("");
      setRating("5");
      const nextSuccess = payload.message || "Отзыв отправлен на модерацию.";
      setSuccess(nextSuccess);
      toast.success(nextSuccess);
    } catch {
      const nextError = "Не удалось отправить отзыв. Попробуйте еще раз.";
      setError(nextError);
      toast.error(nextError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={embedded ? "" : "rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]"}>
      {!embedded && <p className="text-xs uppercase tracking-[0.2em] text-black/45">Оставить отзыв</p>}
      <h3 className={`${embedded ? "font-display text-2xl text-ink" : "mt-3 font-display text-3xl text-ink"}`}>Поделиться впечатлением</h3>
      <p className="mt-2 text-sm text-black/55">После модерации.</p>
      <div className="mt-4 grid gap-4">
        <select value={rating} onChange={(event) => setRating(event.target.value)} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none">
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>{value} / 5</option>
          ))}
        </select>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Поделитесь впечатлением о сервисе, пляже, чистоте и удобствах"
          className="min-h-[110px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
        />
        {error && <p className="rounded-2xl bg-[#f8dede] px-4 py-3 text-sm text-[#8f2c2c]">{error}</p>}
        {success && (
          <div className="rounded-2xl bg-[#dff4e7] px-4 py-3 text-sm text-pine">
            {success}
            <div className="mt-1">
              <Link href="/account" className="underline">
                Открыть мой аккаунт
              </Link>
            </div>
          </div>
        )}
        <button disabled={isSubmitting} className="rounded-full bg-pine px-5 py-3 text-sm font-medium text-white disabled:opacity-70">
          {isSubmitting ? "Отправляем..." : "Отправить отзыв"}
        </button>
      </div>
    </form>
  );
}
