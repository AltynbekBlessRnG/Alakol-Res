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
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#102028_0%,#244b56_100%)] px-5 py-16">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-glow md:grid-cols-[1fr_0.85fr]">
        <div className="bg-pine p-10 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/55">Alakol Select</p>
          <h1 className="mt-6 font-display text-5xl leading-tight">Один вход для гостя, владельца и команды сайта</h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/75">
            Гость может зарегистрироваться сам, сохранять понравившиеся варианты и оставлять отзывы от своего имени. Владелец тоже может зарегистрироваться здесь же, добавить свою зону отдыха и начать получать заявки от гостей.
          </p>
          <div className="mt-8 space-y-3 text-sm text-white/80">
            <p><strong>Пользователь:</strong> user@alakol.kz / user12345</p>
            <p><strong>Владелец:</strong> owner@alakol.kz / owner123</p>
            <p><strong>Админ:</strong> admin@alakol.kz / admin123</p>
          </div>
        </div>
        <div className="p-8 md:p-10">
          {session?.user && (
            <div className="mb-6 rounded-[1.5rem] border border-black/10 bg-[#f7f1e6] p-4 text-sm text-black/68">
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
          <p className="text-sm text-black/55">
            Можно войти под демо-аккаунтом или сразу создать новый аккаунт гостя или владельца. После авторизации сайт сам отправит вас в нужный раздел.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
