"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type LeadCrmFormProps = {
  lead: {
    id: string;
    guestName: string;
    phone: string;
    note?: string;
    ownerComment?: string;
    status: "new" | "contacted" | "no_answer" | "booked" | "closed";
    createdAt: Date;
    resort: { title: string };
  };
};

const statuses = [
  { value: "new", label: "Новый" },
  { value: "contacted", label: "Связались" },
  { value: "no_answer", label: "Не дозвонились" },
  { value: "booked", label: "Бронь подтверждена" },
  { value: "closed", label: "Закрыт" }
] as const;

export function LeadCrmForm({ lead }: LeadCrmFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadCrmFormProps["lead"]["status"]>(lead.status);
  const [ownerComment, setOwnerComment] = useState(lead.ownerComment ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    const response = await fetch(`/api/owner/leads/${lead.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ownerComment })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      const nextError = payload?.message ?? "Не удалось обновить лид.";
      setError(nextError);
      toast.error(nextError);
      setIsSubmitting(false);
      return;
    }

    const nextMessage = "Лид обновлен.";
    setMessage(nextMessage);
    toast.success(nextMessage);
    startTransition(() => {
      router.refresh();
    });
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[1.5rem] bg-mist p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-ink">{lead.guestName}</p>
          <p className="mt-1 text-sm text-black/55">{lead.phone}</p>
        </div>
        <p className="text-xs text-black/40">{new Intl.DateTimeFormat("ru-RU").format(lead.createdAt)}</p>
      </div>
      <p className="mt-3 text-sm text-black/55">{lead.resort.title}</p>
      {lead.note && <p className="mt-3 text-sm leading-6 text-black/65">{lead.note}</p>}
      <div className="mt-4 grid gap-3">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as LeadCrmFormProps["lead"]["status"])}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
        >
          {statuses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <textarea
          value={ownerComment}
          onChange={(event) => setOwnerComment(event.target.value)}
          placeholder="Комментарий менеджера"
          className="min-h-[100px] w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
        />
        <button
          disabled={isSubmitting || isPending}
          className="interactive-surface rounded-full bg-pine px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting || isPending ? "Сохраняем..." : "Обновить лид"}
        </button>
        {message ? <p className="text-sm text-pine">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </form>
  );
}
