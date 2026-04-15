import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/8 bg-[#10181d] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white">Alakol Select</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/65">
            Каталог зон отдыха на Алаколе с фото, ценами, картой и быстрым выходом на звонок, WhatsApp и заявку.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/42">Навигация</p>
          <div className="mt-4 space-y-3 text-sm text-white/72">
            <Link href="/" className="block transition hover:text-white">
              Главная
            </Link>
            <Link href="/catalog" className="block transition hover:text-white">
              Каталог
            </Link>
            <Link href="/favorites" className="block transition hover:text-white">
              Избранное
            </Link>
            <Link href="/compare" className="block transition hover:text-white">
              Сравнение
            </Link>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/42">Для связи</p>
          <div className="mt-4 space-y-3 text-sm text-white/72">
            <p>Подбор по фото, цене, локации и условиям.</p>
            <Link href="/login" className="block transition hover:text-white">
              Войти в кабинет
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
