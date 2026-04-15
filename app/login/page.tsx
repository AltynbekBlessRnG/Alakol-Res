import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { authOptions } from "@/lib/auth";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Вход", "Вход в аккаунт гостя, владельца зоны отдыха или администратора сайта.");

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role === "OWNER") redirect("/owner");
  if (session?.user.role === "ADMIN") redirect("/admin");
  if (session?.user.role === "USER") redirect("/account");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#102028_0%,#244b56_100%)] px-5 py-16">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-glow md:grid-cols-[1fr_0.85fr]">
        <div className="bg-pine p-10 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/55">Alakol Select</p>
          <h1 className="mt-6 font-display text-5xl leading-tight">Один вход для гостя, владельца и команды сайта</h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/75">
            Гость сохраняет понравившиеся варианты и оставляет отзывы от своего имени, владелец управляет карточками и заявками, а администратор модерирует площадку.
          </p>
          <div className="mt-8 space-y-3 text-sm text-white/80">
            <p><strong>Пользователь:</strong> user@alakol.kz / user12345</p>
            <p><strong>Владелец:</strong> owner@alakol.kz / owner123</p>
            <p><strong>Админ:</strong> admin@alakol.kz / admin123</p>
          </div>
        </div>
        <div className="p-8 md:p-10">
          <p className="text-sm text-black/55">
            Можно войти под любым демо-аккаунтом. После авторизации сайт сам отправит вас в нужный раздел, а для обычного пользователя откроет личный аккаунт.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
