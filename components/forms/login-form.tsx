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

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    setError("");
    const email = String(formData.get("email") || "");
    const callbackUrl = searchParams.get("callbackUrl") || (email === "admin@alakol.kz" ? "/admin" : "/owner");

    const result = await signIn("credentials", {
      email,
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
      <div>
        <label htmlFor={emailId} className="mb-2 block text-sm text-black/55">Email</label>
        <Input id={emailId} type="email" name="email" defaultValue="owner@alakol.kz" />
      </div>
      <div>
        <label htmlFor={passwordId} className="mb-2 block text-sm text-black/55">Пароль</label>
        <Input id={passwordId} type="password" name="password" defaultValue="owner123" />
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
