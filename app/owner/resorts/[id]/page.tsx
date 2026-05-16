import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OwnerResortForm } from "@/components/forms/owner-resort-form";
import { requireRole } from "@/lib/session";
import { noIndexMetadata } from "@/lib/seo";
import { getResortByIdFromSupabase } from "@/lib/supabase/data";

export const metadata: Metadata = noIndexMetadata(
  "Редактирование объекта",
  "Служебная страница редактирования карточки объекта."
);

type OwnerResortPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OwnerResortPage({ params, searchParams }: OwnerResortPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const session = await requireRole("OWNER");
  const resort = await getResortByIdFromSupabase(id);

  if (!resort || resort.ownerProfileId !== session.user.ownerProfileId) notFound();

  const error = query.error ? (Array.isArray(query.error) ? query.error[0] : query.error) : undefined;

  return (
    <main className="min-h-screen bg-[#f7f1e6]">
      <OwnerResortForm resort={resort} error={error} />
    </main>
  );
}
