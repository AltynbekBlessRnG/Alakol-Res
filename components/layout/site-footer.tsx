import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/8 bg-[#f3eadb] text-ink">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1.4fr_0.8fr_0.8fr] md:px-8">
        <div className="max-w-md">
          <p className="text-lg font-semibold">Alakol Select</p>
          <p className="mt-3 text-sm leading-6 text-black/58">
            Подбор зон отдыха на Алаколе: цены, фото, карта и быстрый контакт с объектом.
          </p>
          <p className="mt-5 text-xs text-black/42">© {new Date().getFullYear()} Alakol Select</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-black/42">Разделы</p>
          <div className="mt-4 space-y-3 text-sm text-black/64">
            <Link href="/" className="block transition hover:text-pine">
              Главная
            </Link>
            <Link href="/catalog" className="block transition hover:text-pine">
              Каталог
            </Link>
            <Link href="/favorites" className="block transition hover:text-pine">
              Избранное
            </Link>
            <Link href="/compare" className="block transition hover:text-pine">
              Сравнение
            </Link>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-black/42">Действия</p>
          <div className="mt-4 space-y-3 text-sm text-black/64">
            <Link href="/catalog#catalog-map" className="block transition hover:text-pine">
              Карта объектов
            </Link>
            <Link href="/login" className="block transition hover:text-pine">
              Войти
            </Link>
            <Link href="/login" className="block transition hover:text-pine">
              Создать аккаунт
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
