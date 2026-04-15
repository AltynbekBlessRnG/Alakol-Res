"use client";

import Link from "next/link";
import { LogOut, Shield, UserCircle2, UserRound, Building2, Heart } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CompareLink } from "@/components/catalog/compare-link";
import { FavoritesLink } from "@/components/catalog/favorites-link";

type SiteHeaderClientProps = {
  isAuthenticated: boolean;
  role?: "OWNER" | "ADMIN" | "USER";
  userName?: string | null;
};

export function SiteHeaderClient({ isAuthenticated, role, userName }: SiteHeaderClientProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const menuItems = useMemo(() => {
    if (role === "ADMIN") {
      return [{ href: "/admin", label: "Админка", icon: Shield }];
    }

    if (role === "OWNER") {
      return [{ href: "/owner", label: "Кабинет владельца", icon: Building2 }];
    }

    if (role === "USER") {
      return [
        { href: "/account", label: "Мой аккаунт", icon: UserRound },
        { href: "/favorites", label: "Избранное", icon: Heart }
      ];
    }

    return [];
  }, [role]);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const nearTop = currentScrollY < 24;

      if (nearTop) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideDesktop = desktopMenuRef.current?.contains(target);
      const insideMobile = mobileMenuRef.current?.contains(target);

      if (!insideDesktop && !insideMobile) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
    >
      <div className="mx-auto mt-4 flex max-w-7xl items-center justify-between gap-4 rounded-full border border-white/14 bg-[rgba(11,18,24,0.58)] px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.12)] backdrop-blur-md md:px-6">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-white md:text-base">
          Alakol Select
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-white md:flex">
          <Link href="/catalog" className="transition hover:text-[#f2dfb1]">
            Каталог
          </Link>
          <FavoritesLink />
          <CompareLink />
          {!isAuthenticated ? (
            <Link
              href="/login"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#f0dfb8]"
            >
              Войти
            </Link>
          ) : (
            <div className="relative" ref={desktopMenuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.09]"
              >
                <UserCircle2 size={16} />
                {userName || "Аккаунт"}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] min-w-[220px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#102028]/96 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
                  <div className="px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/45">
                    {role === "ADMIN" ? "Администратор" : role === "OWNER" ? "Владелец" : "Пользователь"}
                  </div>
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-white/88 transition hover:bg-white/8"
                    >
                      <item.icon size={16} />
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-white/88 transition hover:bg-white/8"
                  >
                    <LogOut size={16} />
                    Выйти
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/catalog" className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white">
            Каталог
          </Link>
          <FavoritesLink mobile />
          <CompareLink mobile />
          {!isAuthenticated ? (
            <Link href="/login" className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-black">
              Войти
            </Link>
          ) : (
            <div className="relative" ref={mobileMenuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-black"
              >
                Аккаунт
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] min-w-[210px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#102028]/96 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-white/88 transition hover:bg-white/8"
                    >
                      <item.icon size={16} />
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-white/88 transition hover:bg-white/8"
                  >
                    <LogOut size={16} />
                    Выйти
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
