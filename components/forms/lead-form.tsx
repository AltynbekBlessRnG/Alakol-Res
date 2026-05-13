"use client";

import { type FormEvent, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Textarea } from "@/components/ui/input";

type LeadFormProps = {
  resortId: string;
  id?: string;
};

export function LeadForm({ resortId, id }: LeadFormProps) {
  const router = useRouter();
  const guestNameId = useId();
  const phoneId = useId();
  const noteId = useId();
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resortId, guestName, phone, note })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      const nextError = payload?.message ?? "Не удалось отправить заявку.";
      setError(nextError);
      toast.error(nextError);
      setIsSubmitting(false);
      return;
    }

    setGuestName("");
    setPhone("");
    setNote("");
    const nextMessage = "Заявка отправлена. Владельцу уже ушел сигнал.";
    setMessage(nextMessage);
    toast.success(nextMessage);
    startTransition(() => {
      router.refresh();
    });
    setIsSubmitting(false);
  }

  return (
    <form
      id={id}
      onSubmit={onSubmit}
      className="space-y-4 rounded-[1.35rem] bg-white p-5 shadow-[0_14px_42px_rgba(14,26,31,0.08)] md:rounded-[2rem] md:p-6"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-black/45">Быстрая заявка</p>
        <h3 className="mt-2 text-2xl font-semibold text-ink md:mt-3 md:text-3xl">Уточнить условия</h3>
      </div>
      <div>
        <label htmlFor={guestNameId} className="mb-2 block text-sm text-black/55">
          Ваше имя
        </label>
        <Input
          id={guestNameId}
          name="guestName"
          value={guestName}
          onChange={(event) => setGuestName(event.target.value)}
          placeholder="Например, Айгерим"
        />
      </div>
      <div>
        <label htmlFor={phoneId} className="mb-2 block text-sm text-black/55">
          Телефон
        </label>
        <Input
          id={phoneId}
          name="phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+7 777 000 00 00"
        />
      </div>
      <div>
        <label htmlFor={noteId} className="mb-2 block text-sm text-black/55">
          Комментарий
        </label>
        <Textarea
          id={noteId}
          name="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Интересуют даты, питание, условия для детей..."
          className="min-h-[120px]"
        />
      </div>
      <button
        disabled={isSubmitting || isPending}
        className="interactive-surface w-full rounded-full bg-pine px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting || isPending ? "Отправляем..." : "Отправить заявку"}
      </button>
      {message ? <p className="text-sm text-pine">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
