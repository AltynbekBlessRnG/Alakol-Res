"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { CatalogFilters } from "@/lib/resorts";
import { CatalogFiltersPanel } from "@/components/catalog/catalog-filters";

type MobileFiltersProps = {
  filters: CatalogFilters;
  resultCount: number;
};

export function MobileFilters({ filters, resultCount }: MobileFiltersProps) {
  const [open, setOpen] = useState(false);
  const activeCount = Object.values(filters).filter(Boolean).length;

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-pine px-4 text-sm font-medium text-white shadow-[0_12px_30px_rgba(23,53,44,0.22)] lg:hidden"
      >
        <SlidersHorizontal size={16} />
        Фильтры
        {activeCount ? <span className="rounded-full bg-white/16 px-2 py-0.5 text-xs">{activeCount}</span> : null}
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] bg-[rgba(10,18,22,0.46)] lg:hidden">
          <button aria-label="Закрыть фильтры" className="absolute inset-0 h-full w-full cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88svh] overflow-hidden rounded-t-[1.6rem] bg-[#f7f1e6] shadow-[0_-20px_60px_rgba(0,0,0,0.22)]">
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-black/14" />
            <div className="flex items-center justify-between px-4 pb-3 pt-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/38">mobile filters</p>
                <h2 className="mt-1 text-2xl font-semibold text-ink">Подбор</h2>
              </div>
              <button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full border border-black/10 bg-white text-ink">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[calc(88svh-132px)] overflow-y-auto px-3 pb-24">
              <CatalogFiltersPanel filters={filters} />
            </div>

            <div className="absolute inset-x-0 bottom-0 border-t border-black/8 bg-[#f7f1e6]/95 p-3 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-black/60">{resultCount} вариантов</p>
                <button onClick={() => setOpen(false)} className="rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">
                  Показать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
