import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";
import { authOptions } from "@/lib/auth";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Вход", "Вход в аккаунт гостя, владельца зоны отдыха или администратора сайта.");

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-[#f2eadc] px-4 pb-28 pt-24 md:px-6 md:pb-16 md:pt-28">
      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[0.82fr_1fr] lg:items-start">
        <aside className="overflow-hidden rounded-[1.5rem] bg-pine text-white shadow-glow md:rounded-[2rem]">
          <div className="p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">Alakol Select</p>
            <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-tight md:text-4xl">
              Вход и регистрация
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/72">
              Гости сохраняют избранное и отзывы. Владельцы управляют объектами и заявками.
            </p>
          </div>
          <div className="hidden border-t border-white/10 bg-white/8 text-sm text-white/76 sm:grid sm:grid-cols-3 lg:grid-cols-1">
            <div className="border-white/10 p-4 sm:border-r lg:border-b lg:border-r-0">
              <p className="text-white/48">Гость</p>
              <p className="mt-1 font-medium text-white">user@alakol.kz</p>
              <p className="text-xs text-white/55">user12345</p>
            </div>
            <div className="border-white/10 p-4 sm:border-r lg:border-b lg:border-r-0">
              <p className="text-white/48">Владелец</p>
              <p className="mt-1 font-medium text-white">owner@alakol.kz</p>
              <p className="text-xs text-white/55">owner123</p>
            </div>
            <div className="p-4">
              <p className="text-white/48">Админ</p>
              <p className="mt-1 font-medium text-white">admin@alakol.kz</p>
              <p className="text-xs text-white/55">admin123</p>
            </div>
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
