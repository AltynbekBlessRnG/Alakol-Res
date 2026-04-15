import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OwnerResortForm } from "@/components/forms/owner-resort-form";
import { enrichResort, getResortById } from "@/lib/demo-data";
import { requireRole } from "@/lib/session";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Редактирование объекта", "Служебная страница редактирования карточки объекта.");

type OwnerResortPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OwnerResortPage({ params, searchParams }: OwnerResortPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const session = await requireRole("OWNER");
  const resort = getResortById(id);

  if (!resort || resort.ownerProfileId !== session.user.ownerProfileId) notFound();

  return (
    <main className="min-h-screen bg-mist px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-[0.2em] text-black/45">owner / edit resort</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Редактирование карточки</h1>
        {query.error && (
          <p className="mt-4 rounded-[1.25rem] bg-[#f7d7d7] px-4 py-3 text-sm text-[#8f2c2c]">
            Для отправки на модерацию не хватает: {Array.isArray(query.error) ? query.error[0] : query.error}
          </p>
        )}
        <div className="mt-8">
          <OwnerResortForm resort={enrichResort(resort)} />
        </div>
      </div>
    </main>
  );
}
