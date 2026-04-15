"use client";

import { useEffect, useState } from "react";
import { readPublicList, togglePublicListItem } from "@/lib/public-lists";

export function PublicActions({ slug, title }: { slug: string; title: string }) {
  const [favorite, setFavorite] = useState(false);
  const [compared, setCompared] = useState(false);

  useEffect(() => {
    setFavorite(readPublicList("favorites").some((item) => item.slug === slug));
    setCompared(readPublicList("compare").some((item) => item.slug === slug));
  }, [slug]);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => setFavorite(togglePublicListItem("favorites", { slug, title }, 12))}
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
    </div>
  );
}
