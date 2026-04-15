"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Check, Minus, PhoneCall, Scale, Trash2, Waves } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { readPublicList, writePublicList, type PublicStoredItem } from "@/lib/public-lists";

type ComparedResort = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  zone: string;
  distanceToLakeM: number;
  minPrice: number;
  foodOptions: string;
  accommodationType: string;
  beachLine: string;
  transferInfo: string;
  familyFriendly: boolean;
  youthFriendly: boolean;
  hasPool: boolean;
  hasWifi: boolean;
  hasParking: boolean;
  hasKidsZone: boolean;
  contactPhone: string;
  images: Array<{ id: string; url: string; alt: string }>;
  amenities: Array<{ id: string; label: string }>;
};

const featureRows = [
  { label: "Формат отдыха", value: (resort: ComparedResort) => resort.accommodationType },
  { label: "Берег", value: (resort: ComparedResort) => resort.beachLine || "Уточняется" },
  { label: "Питание", value: (resort: ComparedResort) => resort.foodOptions },
  { label: "Трансфер", value: (resort: ComparedResort) => resort.transferInfo || "Уточняется" },
  { label: "Расстояние до воды", value: (resort: ComparedResort) => `${resort.distanceToLakeM} м` },
  { label: "Семейный формат", value: (resort: ComparedResort) => resort.familyFriendly },
  { label: "Для компании", value: (resort: ComparedResort) => resort.youthFriendly },
  { label: "Бассейн", value: (resort: ComparedResort) => resort.hasPool },
  { label: "Wi-Fi", value: (resort: ComparedResort) => resort.hasWifi },
  { label: "Парковка", value: (resort: ComparedResort) => resort.hasParking },
  { label: "Детская зона", value: (resort: ComparedResort) => resort.hasKidsZone }
] as const;

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center gap-2 text-pine">
        <Check size={16} />
        Есть
      </span>
    ) : (
      <span className="inline-flex items-center gap-2 text-black/45">
        <Minus size={16} />
        Нет
      </span>
    );
  }

  return <span>{value}</span>;
}

export function ComparePageClient() {
  const [items, setItems] = useState<PublicStoredItem[]>([]);
  const [resorts, setResorts] = useState<ComparedResort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setItems(readPublicList("compare"));

    const sync = () => {
      const nextItems = readPublicList("compare");
      setItems(nextItems);
    };

    window.addEventListener("alakol-public-list-updated", sync as EventListener);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("alakol-public-list-updated", sync as EventListener);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

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
          return (await response.json()) as ComparedResort;
        })
      );

      if (!cancelled) {
        setResorts(responses.filter(Boolean) as ComparedResort[]);
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [items]);

  const orderedResorts = useMemo(() => {
    return items
      .map((item) => resorts.find((resort) => resort.slug === item.slug))
      .filter(Boolean) as ComparedResort[];
  }, [items, resorts]);

  function remove(slug: string) {
    const nextItems = items.filter((item) => item.slug !== slug);
    setItems(nextItems);
    setResorts((current) => current.filter((item) => item.slug !== slug));
    writePublicList("compare", nextItems);
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] bg-white p-10 text-center shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
        <p className="text-sm uppercase tracking-[0.2em] text-black/38">Сравнение</p>
        <h1 className="mt-4 font-display text-4xl text-ink">Собираем объекты для сравнения</h1>
      </div>
    );
  }

  if (!orderedResorts.length) {
    return (
      <div className="rounded-[2rem] bg-white p-10 text-center shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
        <p className="text-sm uppercase tracking-[0.2em] text-black/38">Пока пусто</p>
        <h1 className="mt-4 font-display text-4xl text-ink">Добавьте 2-4 объекта в сравнение</h1>
        <p className="mt-4 text-sm leading-7 text-black/60">
          На карточках зон отдыха уже есть кнопка “Сравнить”. После этого здесь можно будет быстро увидеть отличия по цене, берегу, условиям и формату отдыха.
        </p>
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
              <div className="flex flex-wrap gap-4 text-sm text-black/58">
                <span className="rounded-full bg-[#f7f1e6] px-3 py-2">от {formatPrice(resort.minPrice)} ₸</span>
                <span className="rounded-full bg-[#f7f1e6] px-3 py-2">{resort.distanceToLakeM} м до воды</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-black/68">
                {resort.amenities.slice(0, 4).map((amenity) => (
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

      <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
        <div className="border-b border-black/8 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-black/38">Таблица отличий</p>
          <h2 className="mt-3 font-display text-4xl text-ink">Сравнить по важным параметрам</h2>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[220px_repeat(4,minmax(170px,1fr))]">
              <div className="border-b border-black/8 bg-[#fcfaf5] px-6 py-4 text-sm font-medium text-black/55">Параметр</div>
              {Array.from({ length: 4 }).map((_, index) => {
                const resort = orderedResorts[index];
                return (
                  <div key={resort?.slug || `empty-${index}`} className="border-b border-l border-black/8 px-6 py-4 text-sm font-medium text-ink">
                    {resort ? resort.title : "Свободный слот"}
                  </div>
                );
              })}
              <div className="bg-[#fcfaf5] px-6 py-4 text-sm font-medium text-black/55">Минимальная цена</div>
              {Array.from({ length: 4 }).map((_, index) => {
                const resort = orderedResorts[index];
                return (
                  <div key={`price-${resort?.slug || index}`} className="border-l border-black/8 px-6 py-4 text-sm text-ink">
                    {resort ? `от ${formatPrice(resort.minPrice)} ₸` : "—"}
                  </div>
                );
              })}
              {featureRows.map((row) => (
                <Fragment key={row.label}>
                  <div className="border-t border-black/8 bg-[#fcfaf5] px-6 py-4 text-sm font-medium text-black/55">
                    {row.label}
                  </div>
                  {Array.from({ length: 4 }).map((_, index) => {
                    const resort = orderedResorts[index];
                    return (
                      <div key={`${row.label}-${resort?.slug || index}`} className="border-l border-t border-black/8 px-6 py-4 text-sm text-ink">
                        {resort ? <FeatureValue value={row.value(resort)} /> : "—"}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
              <div className="border-t border-black/8 bg-[#fcfaf5] px-6 py-4 text-sm font-medium text-black/55">Ключевые удобства</div>
              {Array.from({ length: 4 }).map((_, index) => {
                const resort = orderedResorts[index];
                return (
                  <div key={`amenities-${resort?.slug || index}`} className="border-l border-t border-black/8 px-6 py-4 text-sm text-ink">
                    {resort ? (
                      <div className="flex flex-wrap gap-2">
                        {resort.amenities.slice(0, 6).map((amenity) => (
                          <span key={amenity.id} className="rounded-full bg-[#f7f1e6] px-3 py-1 text-xs">
                            {amenity.label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-white p-8 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
        <div className="flex items-center gap-2 text-sm text-pine">
          <Waves size={16} />
          Как пользоваться сравнением
        </div>
        <p className="mt-4 max-w-3xl text-base leading-8 text-black/66">
          Добавляйте 2-4 зоны отдыха из каталога или карточек объектов, а затем возвращайтесь сюда. Так клиент видит не просто список характеристик, а ясную разницу по цене, берегу, формату и удобствам.
        </p>
      </div>
    </div>
  );
}
