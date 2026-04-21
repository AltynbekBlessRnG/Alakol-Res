"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { readPublicList } from "@/lib/public-lists";

export function FavoritesLink({ mobile = false }: { mobile?: boolean }) {
  const { data: session, status } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      if (status === "loading") return;

      if (session?.user.role === "USER") {
        const response = await fetch("/api/favorites", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { count: number };
        if (!cancelled) {
          setCount(payload.count);
        }
        return;
      }

      setCount(readPublicList("favorites").length);
    };

    sync();
    window.addEventListener("alakol-public-list-updated", sync as EventListener);
    window.addEventListener("storage", sync);
    return () => {
      cancelled = true;
      window.removeEventListener("alakol-public-list-updated", sync as EventListener);
      window.removeEventListener("storage", sync);
    };
  }, [session?.user.role, status]);

  return (
    <Link
      href="/favorites"
      className={
        mobile
          ? "rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white"
          : "inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.09]"
      }
    >
      <Heart size={mobile ? 14 : 16} />
      {mobile ? (count ? `Избр. ${count}` : "Избранное") : count ? `Избранное · ${count}` : "Избранное"}
    </Link>
  );
}
