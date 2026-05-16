"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Heart, Scale } from "lucide-react";
import { toast } from "sonner";
import { readPublicList, togglePublicListItem } from "@/lib/public-lists";

let favoritesPromise: Promise<string[]> | null = null;
let favoriteSlugsCache: string[] | null = null;

async function loadFavoriteSlugs() {
  if (favoriteSlugsCache) return favoriteSlugsCache;
  if (!favoritesPromise) {
    favoritesPromise = fetch("/api/favorites", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return [];
        const payload = (await response.json()) as { slugs: string[] };
        favoriteSlugsCache = payload.slugs;
        return payload.slugs;
      })
      .finally(() => {
        favoritesPromise = null;
      });
  }
  return favoritesPromise;
}

export function PublicActions({ slug, title, compact = false }: { slug: string; title: string; compact?: boolean }) {
  const { data: session, status } = useSession();
  const [favorite, setFavorite] = useState(false);
  const [compared, setCompared] = useState(false);
  const [favoritePending, setFavoritePending] = useState(false);
  const [comparePulse, setComparePulse] = useState(false);
  const isUser = session?.user.role === "USER";

  useEffect(() => {
    setCompared(readPublicList("compare").some((item) => item.slug === slug));
  }, [slug]);

  useEffect(() => {
    let cancelled = false;

    async function syncFavorite() {
      if (status === "loading") return;

      if (!isUser) {
        setFavorite(readPublicList("favorites").some((item) => item.slug === slug));
        return;
      }

      const slugs = await loadFavoriteSlugs();
      if (!cancelled) {
        setFavorite(slugs.includes(slug));
      }
    }

    syncFavorite();

    const syncLocal = () => {
      if (!isUser) {
        setFavorite(readPublicList("favorites").some((item) => item.slug === slug));
      }
      setCompared(readPublicList("compare").some((item) => item.slug === slug));
    };

    window.addEventListener("alakol-public-list-updated", syncLocal as EventListener);
    window.addEventListener("storage", syncLocal);
    return () => {
      cancelled = true;
      window.removeEventListener("alakol-public-list-updated", syncLocal as EventListener);
      window.removeEventListener("storage", syncLocal);
    };
  }, [isUser, slug, status]);

  async function onFavoriteClick() {
    setFavoritePending(true);
    if (!isUser) {
      const nextFavorite = togglePublicListItem("favorites", { slug, title }, 12);
      setFavorite(nextFavorite);
      toast.success(nextFavorite ? "Добавлено в избранное" : "Убрано из избранного");
      setFavoritePending(false);
      return;
    }

    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug })
    });

    if (!response.ok) {
      toast.error("Не удалось обновить избранное");
      setFavoritePending(false);
      return;
    }
    const payload = (await response.json()) as { favorite: boolean };
    if (favoriteSlugsCache) {
      favoriteSlugsCache = payload.favorite
        ? [...new Set([...favoriteSlugsCache, slug])]
        : favoriteSlugsCache.filter((item) => item !== slug);
    }
    setFavorite(payload.favorite);
    toast.success(payload.favorite ? "Добавлено в избранное" : "Убрано из избранного");
    setFavoritePending(false);
    window.dispatchEvent(new Event("alakol-public-list-updated"));
  }

  function onCompareClick() {
    const nextCompared = togglePublicListItem("compare", { slug, title }, 4);
    setCompared(nextCompared);
    toast.success(nextCompared ? "Добавлено в сравнение" : "Убрано из сравнения");
    setComparePulse(true);
    window.setTimeout(() => setComparePulse(false), 220);
  }

  const buttonBase = compact
    ? "interactive-surface inline-flex items-center justify-center gap-2 rounded-full border border-white/18 bg-[rgba(10,18,24,0.66)] px-3.5 py-2 text-xs font-medium text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-md hover:border-white/28 hover:bg-[rgba(10,18,24,0.8)]"
    : "interactive-surface rounded-full bg-white/10 px-4 py-3 text-sm backdrop-blur-sm hover:bg-white/16";

  return (
    <div className={`flex flex-wrap gap-3 ${compact ? "items-center" : ""}`}>
      <button
        type="button"
        onClick={onFavoriteClick}
        disabled={favoritePending}
        aria-pressed={favorite}
        className={`${buttonBase} ${favorite ? "border-[#f3c661]/60 text-[#fff4d6]" : ""} ${favoritePending ? "opacity-70" : ""}`}
      >
        <Heart size={compact ? 14 : 16} className={favorite ? "fill-[#f3c661] text-[#f3c661]" : ""} />
        {favoritePending ? "Сохраняем..." : favorite ? "В избранном" : "Сохранить"}
      </button>
      <button
        type="button"
        onClick={onCompareClick}
        aria-pressed={compared}
        className={`${buttonBase} ${comparePulse ? "scale-[0.98]" : ""}`}
      >
        <Scale size={compact ? 14 : 16} />
        {compared ? "В сравнении" : "Сравнить"}
      </button>
      {status !== "loading" && !session?.user && !compact && (
        <Link href={`/login?callbackUrl=${encodeURIComponent(`/catalog/${slug}`)}`} className={buttonBase}>
          Войти для отзывов
        </Link>
      )}
    </div>
  );
}
