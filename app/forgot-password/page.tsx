import type { Metadata } from "next";
import Link from "next/link";
import { requestPasswordResetAction } from "@/lib/actions";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Сброс пароля", "Служебная страница сброса пароля.");

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#102028_0%,#244b56_100%)] px-5 py-16">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-glow">
        <p className="text-xs uppercase tracking-[0.2em] text-black/45">security</p>
        <h1 className="mt-4 font-display text-5xl text-ink">Сброс пароля</h1>
        <p className="mt-4 text-sm leading-7 text-black/60">
          Для demo-режима токен придёт как внутреннее уведомление в аккаунт пользователя.
        </p>
        {params.sent && <p className="mt-4 rounded-2xl bg-[#d6f0e4] px-4 py-3 text-sm text-pine">Если email существует, токен уже создан.</p>}
        <form action={requestPasswordResetAction} className="mt-6 space-y-4">
          <input name="email" type="email" placeholder="owner@alakol.kz" className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none" />
          <button className="rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">Запросить токен</button>
        </form>
        <Link href="/login" className="mt-6 inline-flex text-sm text-pine underline">Назад ко входу</Link>
      </div>
    </main>
  );
}
