import { NextResponse } from "next/server";
import { z } from "zod";
import { createNotificationInSupabase, createUserInSupabase } from "@/lib/supabase/data";
import { checkRateLimit, addRateLimitHeaders } from "@/lib/rate-limit";

const schema = z
  .discriminatedUnion("accountType", [
    z.object({
      accountType: z.literal("USER"),
      name: z.string().trim().min(2, "Имя слишком короткое."),
      email: z.string().trim().email("Нужен корректный email."),
      password: z.string().min(8, "Пароль должен быть не короче 8 символов."),
      passwordConfirm: z.string().min(8)
    }),
    z.object({
      accountType: z.literal("OWNER"),
      name: z.string().trim().min(2, "Имя слишком короткое."),
      email: z.string().trim().email("Нужен корректный email."),
      password: z.string().min(8, "Пароль должен быть не короче 8 символов."),
      passwordConfirm: z.string().min(8),
      company: z.string().trim().min(2, "Укажите название зоны отдыха или компании."),
      phone: z.string().trim().min(7, "Укажите рабочий телефон."),
      whatsapp: z.string().trim().min(7, "Укажите WhatsApp для гостей.")
    })
  ])
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Пароли не совпадают.",
    path: ["passwordConfirm"]
  });

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(request, { prefix: "register", maxRequests: 3 });
  const headers = new Headers();
  addRateLimitHeaders(headers, rateLimit);

  if (!rateLimit.success) {
    return NextResponse.json(
      { message: "Слишком много попыток регистрации. Попробуйте позже." },
      { status: 429, headers }
    );
  }

  const payload = schema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { message: payload.error.issues[0]?.message ?? "Проверьте форму регистрации." },
      { status: 400, headers }
    );
  }

  const result = await createUserInSupabase({
    email: payload.data.email,
    name: payload.data.name,
    password: payload.data.password,
    role: payload.data.accountType,
    ownerProfile: payload.data.accountType === "OWNER"
      ? {
          company: payload.data.company,
          phone: payload.data.phone,
          whatsapp: payload.data.whatsapp
        }
      : undefined
  });

  if (!result.ok) {
    const message =
      result.reason === "exists"
        ? "Пользователь с таким email уже существует."
        : result.reason === "invalid"
          ? "Проверьте имя, email и пароль."
          : "Не удалось создать аккаунт.";

    return NextResponse.json({ message }, { status: result.reason === "exists" ? 409 : 400, headers });
  }

  await createNotificationInSupabase({
    userId: result.user.id,
    type: "password_reset",
    title: result.user.role === "OWNER" ? "Кабинет владельца готов" : "Аккаунт создан",
    body: result.user.role === "OWNER"
      ? "Можно добавлять свои зоны отдыха, редактировать карточки и получать заявки от гостей."
      : "Добро пожаловать в Alakol Select. Теперь можно сохранять зоны отдыха и оставлять отзывы.",
    href: result.user.role === "OWNER" ? "/owner" : "/account"
  });

  return NextResponse.json(
    {
      ok: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      }
    },
    { status: 201, headers }
  );
}
