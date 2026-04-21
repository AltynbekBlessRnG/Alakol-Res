"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="ru">
      <body className="bg-[#f6f0e4]">
        <main className="min-h-screen px-5 py-20 text-center">
          <div className="mx-auto max-w-md">
            <h1 className="font-display text-3xl text-ink">Критическая ошибка</h1>
            <p className="mt-4 text-black/60">
              Приложение не может загрузиться. Пожалуйста, обновите страницу.
            </p>
            <button
              onClick={reset}
              className="mt-8 rounded-full bg-[#102028] px-5 py-2.5 text-sm font-medium text-white"
            >
              Перезагрузить
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
