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
          ? "rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white"
          : "inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.09]"
      }
    >
      <Scale size={mobile ? 14 : 16} />
      {mobile ? (count ? `Сравн. ${count}` : "Сравнить") : count ? `Сравнение · ${count}` : "Сравнить"}
    </Link>
  );
}
