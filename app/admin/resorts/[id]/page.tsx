import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireRole } from "@/lib/session";
import { noIndexMetadata } from "@/lib/seo";
import { getResortByIdFromSupabase } from "@/lib/supabase/data";

export const metadata: Metadata = noIndexMetadata(
  "Предпросмотр карточки",
  "Служебный предпросмотр объекта для администратора."
);

type AdminResortPreviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminResortPreviewPage({ params }: AdminResortPreviewPageProps) {
  await requireRole("ADMIN");
  const { id } = await params;
  const resort = await getResortByIdFromSupabase(id);

  if (!resort) notFound();

  return (
    <main className="min-h-screen bg-mist px-5 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/45">admin / preview</p>
            <h1 className="mt-3 font-display text-5xl text-ink">{resort.title}</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-black/65">{resort.shortDescription}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-full bg-white px-4 py-2 text-sm text-ink shadow-[0_12px_30px_rgba(14,26,31,0.08)]">
              {resort.status}
            </div>
            {resort.status === "PUBLISHED" ? (
              <Link
                href={`/catalog/${resort.slug}`}
                className="interactive-surface rounded-full bg-pine px-4 py-2 text-sm font-medium text-white"
              >
                Открыть публично
              </Link>
            ) : null}
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {resort.images.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
                <div className="relative aspect-[4/3]">
                  <Image src={image.url} alt={image.alt} fill className="object-cover" />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
              <p className="text-xs uppercase tracking-[0.2em] text-black/45">Ключевая информация</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-black/70">
                <p><strong>Локация:</strong> {resort.zone}, {resort.address}</p>
                <p><strong>Цена:</strong> от {resort.minPrice.toLocaleString("ru-RU")} ₸ до {resort.maxPrice.toLocaleString("ru-RU")} ₸</p>
                <p><strong>До воды:</strong> {resort.distanceToLakeM} м</p>
                <p><strong>Питание:</strong> {resort.foodOptions || "Не указано"}</p>
                <p><strong>Тип:</strong> {resort.accommodationType || "Не указано"}</p>
                <p><strong>Телефон:</strong> {resort.contactPhone || "Не указан"}</p>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
              <p className="text-xs uppercase tracking-[0.2em] text-black/45">Описание</p>
              <p className="mt-4 text-sm leading-7 text-black/70">{resort.description || "Полное описание пока не заполнено."}</p>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
              <p className="text-xs uppercase tracking-[0.2em] text-black/45">Удобства</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {resort.amenities.length ? (
                  resort.amenities.map((amenity) => (
                    <span key={amenity.id} className="rounded-full bg-mist px-3 py-2 text-sm text-ink">
                      {amenity.label}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-black/55">Удобства пока не указаны.</span>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
