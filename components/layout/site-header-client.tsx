"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CompareLink } from "@/components/catalog/compare-link";
import { FavoritesLink } from "@/components/catalog/favorites-link";

type SiteHeaderClientProps = {
  isAuthenticated: boolean;
  role?: "OWNER" | "ADMIN";
};

export function SiteHeaderClient({ isAuthenticated, role }: SiteHeaderClientProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
          {role === "OWNER" && (
            <Link href="/owner" className="transition hover:text-[#f2dfb1]">
              Кабинет
            </Link>
          )}
          {role === "ADMIN" && (
            <Link href="/admin" className="transition hover:text-[#f2dfb1]">
              Админ
            </Link>
          )}
          <Link
            href="/login"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#f0dfb8]"
          >
            {isAuthenticated ? "Сменить аккаунт" : "Войти"}
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/catalog" className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white">
            Каталог
          </Link>
          <FavoritesLink mobile />
          <CompareLink mobile />
          <Link href="/login" className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-black">
            {isAuthenticated ? "Кабинет" : "Войти"}
          </Link>
        </div>
      </div>
    </header>
  );
}
