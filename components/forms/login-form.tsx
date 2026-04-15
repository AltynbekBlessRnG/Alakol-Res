"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const emailId = useId();
  const passwordId = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [email, setEmail] = useState("user@alakol.kz");
  const [password, setPassword] = useState("user12345");

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    setError("");
    const nextEmail = String(formData.get("email") || "");
    const callbackUrl = searchParams.get("callbackUrl") || "/auth/redirect";

    const result = await signIn("credentials", {
      email: nextEmail,
      password: String(formData.get("password") || ""),
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

  return (
    <form action={onSubmit} className="space-y-4">
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
      <div>
        <label htmlFor={emailId} className="mb-2 block text-sm text-black/55">Email</label>
        <Input id={emailId} type="email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </div>
      <div>
        <label htmlFor={passwordId} className="mb-2 block text-sm text-black/55">Пароль</label>
        <Input id={passwordId} type="password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={isPending} className="w-full rounded-full bg-pine px-4 py-3 text-sm font-medium text-white disabled:opacity-60">
        {isPending ? "Входим..." : "Войти"}
      </button>
      <Link href="/forgot-password" className="inline-flex text-sm text-pine underline">
        Забыли пароль?
      </Link>
    </form>
  );
}
