"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Scale, X } from "lucide-react";
import { readPublicList, writePublicList, type PublicStoredItem } from "@/lib/public-lists";

export function CompareBar() {
  const [items, setItems] = useState<PublicStoredItem[]>([]);

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

  if (!items.length) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 px-4">
      <div className="pointer-events-auto mx-auto max-w-5xl rounded-[1.8rem] border border-black/8 bg-[rgba(255,250,243,0.96)] p-4 shadow-[0_22px_80px_rgba(19,32,40,0.18)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                    onClick={() => writePublicList("compare", items.filter((current) => current.slug !== item.slug))}
                    className="grid size-4 place-items-center rounded-full bg-white text-black/55"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => writePublicList("compare", [])}
              className="rounded-full border border-black/10 px-4 py-3 text-sm font-medium text-ink"
            >
              Очистить
            </button>
            <Link href="/compare" className="inline-flex items-center gap-2 rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">
              Открыть сравнение
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
