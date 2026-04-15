import type { Metadata } from "next";
import { resetPasswordAction } from "@/lib/actions";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Новый пароль", "Служебная страница установки нового пароля.");

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#102028_0%,#244b56_100%)] px-5 py-16">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-glow">
        <p className="text-xs uppercase tracking-[0.2em] text-black/45">security</p>
        <h1 className="mt-4 font-display text-5xl text-ink">Новый пароль</h1>
        {params.error && <p className="mt-4 rounded-2xl bg-[#f7d7d7] px-4 py-3 text-sm text-[#8f2c2c]">Неверный токен или слишком короткий пароль.</p>}
        <form action={resetPasswordAction} className="mt-6 space-y-4">
          <input name="token" placeholder="Токен из уведомления" className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none" />
          <input name="password" type="password" placeholder="Минимум 8 символов" className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none" />
          <button className="rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">Сменить пароль</button>
        </form>
      </div>
    </main>
  );
}
