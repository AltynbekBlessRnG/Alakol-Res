"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { readPublicList, togglePublicListItem } from "@/lib/public-lists";

export function PublicActions({ slug, title }: { slug: string; title: string }) {
  const { data: session, status } = useSession();
  const [favorite, setFavorite] = useState(false);
  const [compared, setCompared] = useState(false);
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

      const response = await fetch("/api/favorites", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { slugs: string[] };
      if (!cancelled) {
        setFavorite(payload.slugs.includes(slug));
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
    if (!isUser) {
      setFavorite(togglePublicListItem("favorites", { slug, title }, 12));
      return;
    }

    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug })
    });

    if (!response.ok) return;
    const payload = (await response.json()) as { favorite: boolean };
    setFavorite(payload.favorite);
    window.dispatchEvent(new Event("alakol-public-list-updated"));
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onFavoriteClick}
        className="rounded-full bg-white/10 px-4 py-3 text-sm backdrop-blur-sm"
      >
        {favorite ? "В избранном" : "Сохранить"}
      </button>
      <button
        onClick={() => setCompared(togglePublicListItem("compare", { slug, title }, 4))}
        className="rounded-full bg-white/10 px-4 py-3 text-sm backdrop-blur-sm"
      >
        {compared ? "В сравнении" : "Сравнить"}
      </button>
      {status !== "loading" && !session?.user && (
        <Link href={`/login?callbackUrl=${encodeURIComponent(`/catalog/${slug}`)}`} className="rounded-full bg-white/10 px-4 py-3 text-sm backdrop-blur-sm">
          Войти для отзывов
        </Link>
      )}
    </div>
  );
}
