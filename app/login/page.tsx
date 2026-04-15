import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { authOptions } from "@/lib/auth";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Вход", "Служебная страница входа для владельцев и администратора.");

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role === "OWNER") redirect("/owner");
  if (session?.user.role === "ADMIN") redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#102028_0%,#244b56_100%)] px-5 py-16">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-glow md:grid-cols-[1fr_0.85fr]">
        <div className="bg-pine p-10 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/55">Alakol Select</p>
          <h1 className="mt-6 font-display text-5xl leading-tight">Вход для владельцев и суперадмина</h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/75">
            Для локального запуска уже есть seed-аккаунты. После входа владелец попадает в управление своими объектами, а админ в модерацию.
          </p>
        </div>
        <div className="p-8 md:p-10">
          <p className="text-sm text-black/55">Демо-доступ уже подставлен в форму, можно сразу войти. Для production-потока теперь есть и сценарий сброса пароля.</p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
