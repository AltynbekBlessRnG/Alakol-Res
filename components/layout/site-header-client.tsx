"use client";

import Link from "next/link";
import { Building2, Heart, Home, LogIn, LogOut, Menu, Search, Shield, UserCircle2, UserRound, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { CompareLink } from "@/components/catalog/compare-link";
import { FavoritesLink } from "@/components/catalog/favorites-link";
import { BrandMark } from "@/components/layout/brand-mark";

type SiteHeaderClientProps = {
  isAuthenticated?: boolean;
  role?: "OWNER" | "ADMIN" | "USER";
  userName?: string | null;
};

export function SiteHeaderClient({ isAuthenticated, role, userName }: SiteHeaderClientProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const effectiveRole = role ?? session?.user.role;
  const effectiveUserName = userName ?? session?.user.name ?? null;
  const effectiveAuthenticated = typeof isAuthenticated === "boolean" ? isAuthenticated : Boolean(session?.user);
  const isSessionLoading = status === "loading" && typeof isAuthenticated !== "boolean";

  const accountLinks = useMemo(() => {
    if (effectiveRole === "ADMIN") {
      return [{ href: "/admin", label: "Админка", icon: Shield }];
    }

    if (effectiveRole === "OWNER") {
      return [{ href: "/owner", label: "Кабинет владельца", icon: Building2 }];
    }

    if (effectiveRole === "USER") {
      return [
        { href: "/account", label: "Мой аккаунт", icon: UserRound },
        { href: "/favorites", label: "Избранное", icon: Heart }
      ];
    }

    return [];
  }, [effectiveRole]);

  const roleLabel = effectiveRole === "ADMIN" ? "Администратор" : effectiveRole === "OWNER" ? "Владелец" : "Пользователь";
  const hideMobileNav = pathname === "/login" || pathname === "/forgot-password" || pathname?.startsWith("/reset-password");

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/8 bg-[#fbf7ef]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:h-20 md:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <BrandMark className="size-10 md:size-11" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold uppercase tracking-[0.16em] text-ink md:text-base">
                Alakol Select
              </span>
              <span className="hidden text-xs text-black/48 sm:block">Каталог зон отдыха</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full border border-black/8 bg-white px-2 py-2 text-sm font-medium text-ink shadow-[0_10px_32px_rgba(19,32,40,0.08)] md:flex">
            <Link href="/catalog" className="rounded-full px-4 py-2 transition hover:bg-mist">
              Каталог
            </Link>
            <FavoritesLink />
            <CompareLink />
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {!effectiveAuthenticated ? (
              <Link
                href="/login"
                className={`inline-flex items-center gap-2 rounded-full bg-pine px-4 py-3 text-sm font-semibold text-white ${isSessionLoading ? "opacity-80" : ""}`}
              >
                <LogIn size={16} />
                Войти
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-3 text-sm font-medium text-ink shadow-[0_10px_32px_rgba(19,32,40,0.08)]"
              >
                <UserCircle2 size={17} />
                <span className="max-w-[160px] truncate">{effectiveUserName || "Аккаунт"}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="grid size-11 place-items-center rounded-full border border-black/8 bg-white text-ink shadow-[0_10px_28px_rgba(19,32,40,0.08)] md:hidden"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-black/8 bg-[#fbf7ef] px-4 py-4 shadow-[0_20px_60px_rgba(19,32,40,0.12)] md:absolute md:right-8 md:top-[calc(100%+0.5rem)] md:w-80 md:rounded-[1.5rem] md:border md:p-3">
            {effectiveAuthenticated ? (
              <div className="mb-3 rounded-[1.1rem] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-black/42">{roleLabel}</p>
                <p className="mt-1 truncate text-sm font-medium text-ink">{effectiveUserName || "Аккаунт"}</p>
              </div>
            ) : null}

            <div className="grid gap-2">
              <Link href="/catalog" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-ink">
                <Search size={17} />
                Открыть каталог
              </Link>
              {effectiveAuthenticated ? (
                <>
                  {accountLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-ink"
                    >
                      <item.icon size={17} />
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left text-sm font-medium text-ink"
                  >
                    <LogOut size={17} />
                    Выйти
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-2xl bg-pine px-4 py-3 text-sm font-medium text-white">
                  <LogIn size={17} />
                  Войти
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {!hideMobileNav && (
      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 gap-1 rounded-[1.35rem] border border-black/8 bg-[#fbf7ef] p-1.5 shadow-[0_18px_60px_rgba(19,32,40,0.18)] md:hidden">
        <Link href="/" className="flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-ink">
          <Home size={17} />
          Главная
        </Link>
        <Link href="/catalog" className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-pine px-2 py-2 text-[11px] font-medium text-white">
          <Search size={17} />
          Каталог
        </Link>
        <Link href="/favorites" className="flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-ink">
          <Heart size={17} />
          Избранное
        </Link>
        <Link href={effectiveAuthenticated ? (effectiveRole === "OWNER" ? "/owner" : effectiveRole === "ADMIN" ? "/admin" : "/account") : "/login"} className="flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-ink">
          <UserCircle2 size={17} />
          Кабинет
        </Link>
      </nav>
      )}
    </>
  );
}
