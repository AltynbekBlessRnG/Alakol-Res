"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "register";

export function LoginForm() {
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  async function onLogin() {
    const callbackUrl = searchParams.get("callbackUrl") || "/auth/redirect";

    await signOut({ redirect: false });

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl
    });

    if (result?.error) {
      setError("Не удалось войти. Проверьте email и пароль.");
      setIsPending(false);
      return;
    }

    router.push(result?.url || "/");
    router.refresh();
  }

  async function onRegister() {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountType: "USER",
        name,
        email,
        password,
        passwordConfirm
      })
    });

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(payload?.message ?? "Не удалось создать аккаунт.");
      setIsPending(false);
      return;
    }

    setSuccess("Аккаунт создан. Входим автоматически...");
    await onLogin();
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError("");
    setSuccess("");

    if (mode === "register") {
      await onRegister();
      return;
    }

    await onLogin();
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setSuccess("");

    if (nextMode === "register") {
      setEmail("");
      setPassword("");
      setPasswordConfirm("");
      setName("");
    }
  }

  const title = mode === "register" ? "Создать аккаунт" : "Войти в аккаунт";
  const subtitle = mode === "register" ? "Для избранного, сравнения и отзывов." : "Введите email и пароль.";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold leading-tight text-ink md:text-3xl">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-black/55">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 rounded-full border border-black/10 bg-[#f7f1e6] p-1 text-sm font-medium sm:inline-grid">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={`rounded-full px-4 py-2 transition ${mode === "login" ? "bg-pine text-white" : "text-black/65"}`}
        >
          Войти
        </button>
        <button
          type="button"
          onClick={() => switchMode("register")}
          className={`rounded-full px-4 py-2 transition ${mode === "register" ? "bg-pine text-white" : "text-black/65"}`}
        >
          Регистрация
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "register" ? (
          <div>
            <p className="mb-4 rounded-[1rem] bg-[#f7f1e6] px-4 py-3 text-sm leading-6 text-black/62">
              Владельцев подключаем отдельно, чтобы карточки в каталоге оставались проверенными.
            </p>
            <div>
              <label htmlFor={nameId} className="mb-2 block text-sm text-black/55">
                Ваше имя
              </label>
              <Input id={nameId} type="text" name="name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
          </div>
        ) : null}
        <div>
          <label htmlFor={emailId} className="mb-2 block text-sm text-black/55">
            Email
          </label>
          <Input id={emailId} type="email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div>
          <label htmlFor={passwordId} className="mb-2 block text-sm text-black/55">
            Пароль
          </label>
          <Input
            id={passwordId}
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {mode === "register" ? (
          <div>
            <label htmlFor={confirmPasswordId} className="mb-2 block text-sm text-black/55">
              Повторите пароль
            </label>
            <Input
              id={confirmPasswordId}
              type="password"
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
            />
          </div>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-pine">{success}</p> : null}
        <button
          type="submit"
          disabled={isPending}
          className="interactive-surface w-full rounded-full bg-pine px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending
            ? (mode === "register" ? "Создаём аккаунт..." : "Входим...")
            : mode === "register"
              ? "Создать аккаунт"
              : "Войти"}
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            className="text-black/55 underline decoration-black/20 underline-offset-4 transition hover:text-pine"
          >
            {mode === "login" ? "Создать аккаунт" : "Уже есть аккаунт"}
          </button>
          <Link href="/forgot-password" className="text-pine underline decoration-pine/30 underline-offset-4">
            Забыли пароль?
          </Link>
        </div>
      </form>
    </div>
  );
}
