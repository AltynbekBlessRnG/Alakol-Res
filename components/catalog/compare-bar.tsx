"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Scale, X } from "lucide-react";
import { toast } from "sonner";
import { readPublicList, writePublicList, type PublicStoredItem } from "@/lib/public-lists";

export function CompareBar() {
  const [items, setItems] = useState<PublicStoredItem[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const sync = () => setItems(readPublicList("compare"));
    sync();
    window.addEventListener("alakol-public-list-updated", sync as EventListener);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("alakol-public-list-updated", sync as EventListener);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!items.length || pathname === "/compare") return null;

  function removeItem(slug: string) {
    writePublicList("compare", items.filter((current) => current.slug !== slug));
    toast.success("Убрано из сравнения");
  }

  function clearItems() {
    writePublicList("compare", []);
    toast.success("Сравнение очищено");
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 px-3 md:bottom-4 md:px-4">
      <div className="pointer-events-auto mx-auto max-w-5xl rounded-[1.25rem] border border-black/8 bg-[rgba(255,250,243,0.96)] p-3 shadow-[0_18px_60px_rgba(19,32,40,0.18)] backdrop-blur-xl md:rounded-[1.8rem] md:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium text-ink">
              <Scale size={16} />
              Сравнение объектов
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {items.map((item) => (
                <span key={item.slug} className="inline-flex items-center gap-2 rounded-full bg-[#f7f1e6] px-3 py-2 text-xs text-black/70">
                  <span className="max-w-[150px] truncate">{item.title}</span>
                  <button
                    type="button"
                    aria-label={`Убрать ${item.title} из сравнения`}
                    onClick={() => removeItem(item.slug)}
                    className="grid size-4 place-items-center rounded-full bg-white text-black/55"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3">
            <button
              type="button"
              onClick={clearItems}
              className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-medium text-ink md:py-3"
            >
              Очистить
            </button>
            <Link href="/compare" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-pine px-5 py-2.5 text-sm font-medium text-white md:flex-none md:py-3">
              Открыть сравнение
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
