"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Scale } from "lucide-react";
import { readPublicList } from "@/lib/public-lists";

export function CompareLink({ mobile = false }: { mobile?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(readPublicList("compare").length);
    sync();
    window.addEventListener("alakol-public-list-updated", sync as EventListener);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("alakol-public-list-updated", sync as EventListener);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <Link
      href="/compare"
      className={
        mobile
          ? "inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-3 py-2 text-xs font-semibold text-ink"
          : "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-ink transition hover:bg-mist"
      }
    >
      <Scale size={mobile ? 14 : 16} />
      {mobile ? (count ? `Сравн. ${count}` : "Сравнить") : count ? `Сравнение · ${count}` : "Сравнить"}
    </Link>
  );
}
