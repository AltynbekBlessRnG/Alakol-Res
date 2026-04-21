"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function CatalogErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Catalog error:", error);
  }, [error]);

  return (
    <main className="min-h-[60vh] bg-[#f6f0e4] px-5 py-20 text-center">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-3xl text-ink">Ошибка загрузки каталога</h1>
        <p className="mt-4 text-black/60">
          Не удалось загрузить список зон отдыха. Попробуйте обновить страницу.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-[#102028] px-5 py-2.5 text-sm font-medium text-white"
          >
            Попробовать снова
          </button>
          <Link
            href="/"
            className="rounded-full border border-black/20 px-5 py-2.5 text-sm font-medium text-ink"
          >
            На главную
          </Link>
        </div>
      </div>
    </main>
  );
}
