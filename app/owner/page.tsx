import type { Metadata } from "next";
import Link from "next/link";
import { LeadCrmForm } from "@/components/forms/lead-crm-form";
import { NotificationsPanel } from "@/components/layout/notifications-panel";
import { requireRole } from "@/lib/session";
import { createDraftResortAction } from "@/lib/actions";
import { noIndexMetadata } from "@/lib/seo";
import { listNotificationsFromSupabase, listOwnerLeadsFromSupabase, listOwnerResortsFromSupabase } from "@/lib/supabase/data";

export const metadata: Metadata = noIndexMetadata("Кабинет владельца", "Служебный кабинет владельца зоны отдыха.");

export default async function OwnerDashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireRole("OWNER");
  const params = await searchParams;
  const resorts = await listOwnerResortsFromSupabase(session.user.ownerProfileId!);
  const leads = await listOwnerLeadsFromSupabase(session.user.ownerProfileId!, {
    status: (Array.isArray(params.status) ? params.status[0] : params.status) as "all" | "new" | "contacted" | "no_answer" | "booked" | "closed" | undefined,
    q: Array.isArray(params.q) ? params.q[0] : params.q
  });
  const notifications = await listNotificationsFromSupabase(session.user.id, 6);

  return (
    <main className="min-h-screen bg-mist px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/45">owner dashboard</p>
            <h1 className="mt-3 font-display text-5xl text-ink">Ваши объекты и входящие заявки</h1>
          </div>
          <form action={createDraftResortAction}>
            <button className="rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">Добавить объект</button>
          </form>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            {resorts.map((resort) => (
              <Link key={resort.id} href={`/owner/resorts/${resort.id}`} className="block rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-black/45">{resort.zone}</p>
                    <h2 className="mt-2 font-display text-3xl text-ink">{resort.title}</h2>
                    <p className="mt-2 text-sm text-black/60">{resort.shortDescription}</p>
                  </div>
                  <div className="rounded-full bg-mist px-4 py-2 text-sm text-ink">{resort.status}</div>
                </div>
              </Link>
            ))}
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
              <p className="text-xs uppercase tracking-[0.2em] text-black/45">CRM лидов</p>
              <form action="/owner" className="mt-5 grid gap-3 md:grid-cols-[1fr_160px]">
                <input name="q" defaultValue={Array.isArray(params.q) ? params.q[0] : params.q} placeholder="Имя, телефон, объект" className="rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none" />
                <select name="status" defaultValue={(Array.isArray(params.status) ? params.status[0] : params.status) || "all"} className="rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none">
                  <option value="all">Все статусы</option>
                  <option value="new">Новые</option>
                  <option value="contacted">Связались</option>
                  <option value="no_answer">Не дозвонились</option>
                  <option value="booked">Бронь</option>
                  <option value="closed">Закрыт</option>
                </select>
              </form>
              <div className="mt-6 space-y-4">
                {leads.length ? leads.map((lead) => (
                  <LeadCrmForm key={lead.id} lead={lead} />
                )) : <p className="text-sm text-black/55">Пока заявок нет.</p>}
              </div>
            </div>
            <NotificationsPanel notifications={notifications} />
          </div>
        </section>
      </div>
    </main>
  );
}
