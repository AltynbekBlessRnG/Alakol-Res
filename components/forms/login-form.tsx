"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "register";
type RegisterAccountType = "USER" | "OWNER";

export function LoginForm() {
  const nameId = useId();
  const companyId = useId();
  const phoneId = useId();
  const whatsappId = useId();
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
  const [accountType, setAccountType] = useState<RegisterAccountType>("USER");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("user@alakol.kz");
  const [password, setPassword] = useState("user12345");
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
        accountType,
        name,
        email,
        password,
        passwordConfirm,
        ...(accountType === "OWNER" ? { company, phone, whatsapp } : {})
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

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-full border border-black/10 bg-[#f7f1e6] p-1">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
            setSuccess("");
          }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === "login" ? "bg-pine text-white" : "text-black/65"}`}
        >
          Войти
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError("");
              setSuccess("");
              setEmail("");
              setPassword("");
              setPasswordConfirm("");
              setName("");
              setCompany("");
              setPhone("");
              setWhatsapp("");
              setAccountType("USER");
            }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === "register" ? "bg-pine text-white" : "text-black/65"}`}
        >
          Регистрация
        </button>
      </div>

      {mode === "login" ? (
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Гость", email: "user@alakol.kz", password: "user12345" },
            { label: "Владелец", email: "owner@alakol.kz", password: "owner123" },
            { label: "Админ", email: "admin@alakol.kz", password: "admin123" }
          ].map((preset) => (
            <button
              key={preset.email}
              type="button"
              onClick={() => {
                setEmail(preset.email);
                setPassword(preset.password);
              }}
              className="rounded-full border border-black/10 px-3 py-2 text-xs font-medium text-black/70 transition hover:border-pine hover:text-pine"
            >
              {preset.label}
            </button>
          ))}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "register" ? (
          <>
            <div className="rounded-[1.6rem] border border-black/10 bg-[#f7f1e6] p-2">
              <p className="px-3 pb-2 text-xs uppercase tracking-[0.18em] text-black/40">Тип аккаунта</p>
              <div className="grid gap-2 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setAccountType("USER")}
                  className={`rounded-[1.2rem] px-4 py-3 text-left transition ${accountType === "USER" ? "bg-pine text-white" : "bg-white text-black/65"}`}
                >
                  <p className="text-sm font-medium">Гость</p>
                  <p className={`mt-1 text-xs leading-5 ${accountType === "USER" ? "text-white/75" : "text-black/45"}`}>
                    Сохранять понравившиеся зоны и оставлять отзывы.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("OWNER")}
                  className={`rounded-[1.2rem] px-4 py-3 text-left transition ${accountType === "OWNER" ? "bg-pine text-white" : "bg-white text-black/65"}`}
                >
                  <p className="text-sm font-medium">Владелец зоны отдыха</p>
                  <p className={`mt-1 text-xs leading-5 ${accountType === "OWNER" ? "text-white/75" : "text-black/45"}`}>
                    Добавлять свои объекты, редактировать карточки и получать заявки.
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor={nameId} className="mb-2 block text-sm text-black/55">
                Ваше имя
              </label>
              <Input id={nameId} type="text" name="name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>

            {accountType === "OWNER" ? (
              <>
                <div>
                  <label htmlFor={companyId} className="mb-2 block text-sm text-black/55">
                    Название зоны отдыха или компании
                  </label>
                  <Input id={companyId} type="text" name="company" value={company} onChange={(event) => setCompany(event.target.value)} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor={phoneId} className="mb-2 block text-sm text-black/55">
                      Телефон
                    </label>
                    <Input id={phoneId} type="text" name="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
                  </div>
                  <div>
                    <label htmlFor={whatsappId} className="mb-2 block text-sm text-black/55">
                      WhatsApp
                    </label>
                    <Input id={whatsappId} type="text" name="whatsapp" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} />
                  </div>
                </div>
              </>
            ) : null}
          </>
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
            ? (mode === "register" ? (accountType === "OWNER" ? "Создаём кабинет владельца..." : "Создаём аккаунт...") : "Входим...")
            : mode === "register"
              ? (accountType === "OWNER" ? "Создать кабинет владельца" : "Создать аккаунт")
              : "Войти"}
        </button>
        <Link href="/forgot-password" className="inline-flex text-sm text-pine underline">
          Забыли пароль?
        </Link>
      </form>
    </div>
  );
}
