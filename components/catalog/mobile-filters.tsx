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
        className="inline-flex w-full items-center justify-between rounded-[1.4rem] border border-black/8 bg-white px-4 py-4 text-left shadow-[0_14px_35px_rgba(19,32,40,0.08)] lg:hidden"
      >
        <span>
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <SlidersHorizontal size={16} />
            Фильтры и подбор
          </span>
          <span className="mt-1 block text-xs text-black/55">
            {activeCount ? `Активно фильтров: ${activeCount}` : "Выберите бюджет, зону и формат отдыха"}
          </span>
        </span>
        <span className="rounded-full bg-[#f7f1e6] px-3 py-2 text-xs font-medium text-pine">{resultCount}</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] bg-[rgba(10,18,22,0.48)] lg:hidden">
          <button aria-label="Закрыть фильтры" className="absolute inset-0 h-full w-full cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88svh] rounded-t-[2rem] bg-[#f7f1e6] shadow-[0_-20px_60px_rgba(0,0,0,0.22)]">
            <div className="mx-auto w-14 rounded-full bg-black/10 py-1 mt-3" />
            <div className="flex items-center justify-between px-5 pb-4 pt-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-black/38">mobile filters</p>
                <h2 className="mt-2 font-display text-3xl text-ink">Подобрать на телефоне</h2>
              </div>
              <button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full border border-black/10 bg-white text-ink">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[calc(88svh-128px)] overflow-y-auto px-4 pb-28">
              <div className="mb-4 rounded-[1.6rem] bg-white px-4 py-4 text-sm leading-6 text-black/60 shadow-[0_12px_30px_rgba(19,32,40,0.06)]">
                Здесь всё собрано в один bottom-sheet: выберите нужные параметры и вернитесь к карточкам без потери контекста.
              </div>
              <CatalogFiltersPanel filters={filters} />
            </div>
            <div className="absolute inset-x-0 bottom-0 border-t border-black/8 bg-[#f7f1e6]/95 p-4 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-black/60">Подходящих объектов: {resultCount}</p>
                <button onClick={() => setOpen(false)} className="rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">
                  Показать варианты
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
