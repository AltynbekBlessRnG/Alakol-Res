"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { Heart, PhoneCall, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { readPublicList, writePublicList, type PublicStoredItem } from "@/lib/public-lists";

type FavoriteResort = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  zone: string;
  distanceToLakeM: number;
  minPrice: number;
  foodOptions: string;
  contactPhone: string;
  images: Array<{ id: string; url: string; alt: string }>;
  amenities: Array<{ id: string; label: string }>;
};

export function FavoritesPageClient() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<PublicStoredItem[]>([]);
  const [resorts, setResorts] = useState<FavoriteResort[]>([]);
  const [loading, setLoading] = useState(true);
  const isUser = session?.user.role === "USER";

  useEffect(() => {
    if (isUser || status === "loading") return;

    setItems(readPublicList("favorites"));

    const sync = () => setItems(readPublicList("favorites"));
    window.addEventListener("alakol-public-list-updated", sync as EventListener);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("alakol-public-list-updated", sync as EventListener);
      window.removeEventListener("storage", sync);
    };
  }, [isUser, status]);

  useEffect(() => {
    let cancelled = false;

    if (status === "loading") return;

    if (isUser) {
      async function loadUserFavorites() {
        setLoading(true);
        const response = await fetch("/api/favorites", { cache: "no-store" });
        if (!response.ok) {
          if (!cancelled) {
            setResorts([]);
            setLoading(false);
          }
          return;
        }

        const payload = (await response.json()) as { favorites: FavoriteResort[] };
        if (!cancelled) {
          setResorts(payload.favorites || []);
          setItems((payload.favorites || []).map((item) => ({ slug: item.slug, title: item.title })));
          setLoading(false);
        }
      }

      loadUserFavorites();

      const sync = () => void loadUserFavorites();
      window.addEventListener("alakol-public-list-updated", sync as EventListener);
      return () => {
        cancelled = true;
        window.removeEventListener("alakol-public-list-updated", sync as EventListener);
      };
    }

    if (!items.length) {
      setResorts([]);
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      const responses = await Promise.all(
        items.map(async (item) => {
          const response = await fetch(`/api/resorts/${item.slug}`, { cache: "no-store" });
          if (!response.ok) return null;
          return (await response.json()) as FavoriteResort;
        })
      );

      if (!cancelled) {
        setResorts(responses.filter(Boolean) as FavoriteResort[]);
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [isUser, items, status]);

  const orderedResorts = useMemo(() => {
    return items
      .map((item) => resorts.find((resort) => resort.slug === item.slug))
      .filter(Boolean) as FavoriteResort[];
  }, [items, resorts]);

  async function remove(slug: string) {
    if (isUser) {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug })
      });

      if (!response.ok) return;

      setResorts((current) => current.filter((resort) => resort.slug !== slug));
      setItems((current) => current.filter((item) => item.slug !== slug));
      window.dispatchEvent(new Event("alakol-public-list-updated"));
      return;
    }

    const nextItems = items.filter((item) => item.slug !== slug);
    setItems(nextItems);
    setResorts((current) => current.filter((resort) => resort.slug !== slug));
    writePublicList("favorites", nextItems);
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] bg-white p-10 text-center shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
        <p className="text-sm uppercase tracking-[0.2em] text-black/38">Избранное</p>
        <h1 className="mt-4 font-display text-4xl text-ink">Собираем сохранённые объекты</h1>
      </div>
    );
  }

  if (!orderedResorts.length) {
    return (
      <div className="rounded-[2rem] bg-white p-10 text-center shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
        <p className="text-sm uppercase tracking-[0.2em] text-black/38">Пока пусто</p>
        <h1 className="mt-4 font-display text-4xl text-ink">Сохраняйте объекты, чтобы вернуться к ним позже</h1>
        <p className="mt-4 text-sm leading-7 text-black/60">
          Когда зона отдыха кажется интересной, не обязательно сразу принимать решение. Добавьте её в избранное и спокойно вернитесь к сравнению позже.
        </p>
        {!session?.user && (
          <Link href="/login?callbackUrl=%2Ffavorites" className="mt-4 inline-flex rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-ink">
            Войти, чтобы синхронизировать избранное
          </Link>
        )}
        <Link href="/catalog" className="mt-6 inline-flex rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-3">
        {orderedResorts.map((resort) => (
          <div key={resort.id} className="overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
            <div className="relative h-72 overflow-hidden">
              {resort.images[0] && <Image src={resort.images[0].url} alt={resort.images[0].alt} fill className="object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <button
                type="button"
                onClick={() => remove(resort.slug)}
                className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/88 px-3 py-2 text-xs font-medium text-ink backdrop-blur"
              >
                <Trash2 size={14} />
                Убрать
              </button>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.24em] text-white/70">{resort.zone}</p>
                <h2 className="mt-2 font-display text-3xl">{resort.title}</h2>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <p className="text-sm leading-6 text-black/65">{resort.shortDescription}</p>
              <div className="flex flex-wrap gap-3 text-sm text-black/58">
                <span className="rounded-full bg-[#f7f1e6] px-3 py-2">от {formatPrice(resort.minPrice)} ₸</span>
                <span className="rounded-full bg-[#f7f1e6] px-3 py-2">{resort.distanceToLakeM} м до воды</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-black/68">
                {resort.amenities.slice(0, 5).map((amenity) => (
                  <span key={amenity.id} className="rounded-full bg-[#f7f1e6] px-3 py-2">
                    {amenity.label}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/catalog/${resort.slug}`} className="rounded-full border border-black/10 px-4 py-3 text-sm font-medium text-ink">
                  Открыть карточку
                </Link>
                <a href={`tel:${resort.contactPhone}`} className="inline-flex items-center gap-2 rounded-full bg-pine px-4 py-3 text-sm font-medium text-white">
                  <PhoneCall size={16} />
                  Позвонить
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[2rem] bg-white p-8 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
        <div className="flex items-center gap-2 text-sm text-pine">
          <Heart size={16} />
          Как использовать избранное
        </div>
        <p className="mt-4 max-w-3xl text-base leading-8 text-black/66">
          Избранное нужно для более мягкого выбора: сохраните всё, что понравилось визуально, а потом вернитесь к этим объектам уже с холодной головой или откройте сравнение для финального решения.
        </p>
      </div>
    </div>
  );
}
