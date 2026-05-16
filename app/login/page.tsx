import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";
import { authOptions } from "@/lib/auth";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Вход", "Вход и регистрация в Alakol Select.");

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-[#f2eadc] px-4 pb-28 pt-24 md:px-6 md:pb-16 md:pt-28">
      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[0.78fr_1fr] lg:items-start">
        <aside className="overflow-hidden rounded-[1.5rem] bg-pine text-white shadow-glow md:rounded-[2rem]">
          <div className="p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">Alakol Select</p>
            <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-tight md:text-4xl">
              Вход и регистрация
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/72">
              Сохраните понравившиеся варианты и возвращайтесь к ним в любой момент.
            </p>
          </div>
          <div className="border-t border-white/10 bg-white/8 p-6 text-sm leading-6 text-white/72 md:p-8">
            Владельцев добавляем вручную после проверки объекта.
          </div>
        </aside>
        <section className="rounded-[1.5rem] bg-white p-5 shadow-[0_18px_70px_rgba(14,26,31,0.08)] md:rounded-[2rem] md:p-8">
          {session?.user && (
            <div className="mb-5 rounded-[1.25rem] border border-black/10 bg-[#f7f1e6] p-4 text-sm text-black/68">
              Сейчас вы уже вошли как <strong>{session.user.name}</strong> ({session.user.role}).
              <div className="mt-2 flex flex-wrap gap-3">
                <Link
                  href={session.user.role === "ADMIN" ? "/admin" : session.user.role === "OWNER" ? "/owner" : "/account"}
                  className="text-pine underline"
                >
                  Открыть текущий раздел
                </Link>
                <span>Или просто войдите ниже под другим аккаунтом.</span>
              </div>
            </div>
          )}
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
