import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { LoginForm } from "@/components/forms/login-form";
import { authOptions } from "@/lib/auth";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Вход", "Вход и регистрация в Alakol Select.");

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-[#f2eadc] px-4 pb-28 pt-24 md:px-6 md:pb-16 md:pt-28">
      <div className="mx-auto w-full max-w-3xl">
        <section className="rounded-[1.5rem] bg-white p-5 shadow-[0_18px_70px_rgba(14,26,31,0.08)] md:rounded-[2rem] md:p-8">
          {session?.user && (
            <div className="mb-5 rounded-[1.25rem] border border-black/10 bg-[#f7f1e6] p-4 text-sm text-black/68">
              Сейчас вы уже вошли как <strong>{session.user.name}</strong> ({session.user.role}).
              <div className="mt-2 flex flex-wrap gap-3">
                <a
                  href={session.user.role === "ADMIN" ? "/admin" : session.user.role === "OWNER" ? "/owner" : "/account"}
                  className="text-pine underline"
                >
                  Открыть текущий раздел
                </a>
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
