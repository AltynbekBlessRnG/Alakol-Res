import type { Metadata } from "next";
import { AdminReviewForm } from "@/components/forms/admin-review-form";
import { PendingReviewModeration } from "@/components/forms/pending-review-moderation";
import { NotificationsPanel } from "@/components/layout/notifications-panel";
import { requireRole } from "@/lib/session";
import { noIndexMetadata } from "@/lib/seo";
import {
  listAnalyticsSummaryFromSupabase,
  listAuditFromSupabase,
  listIncompleteResortsFromSupabase,
  listNotificationsFromSupabase,
  listPendingResortsFromSupabase,
  listPendingReviewsFromSupabase
} from "@/lib/supabase/data";

export const metadata: Metadata = noIndexMetadata("Админка", "Служебная страница модерации и управления каталогом.");

export default async function AdminPage() {
  const session = await requireRole("ADMIN");
  const [pending, audit, analytics, incompleteRows, pendingReviews, notifications] = await Promise.all([
    listPendingResortsFromSupabase(),
    listAuditFromSupabase(8),
    listAnalyticsSummaryFromSupabase(),
    listIncompleteResortsFromSupabase(),
    listPendingReviewsFromSupabase(),
    listNotificationsFromSupabase(session.user.id, 6)
  ]);
  const incomplete = incompleteRows.slice(0, 6);

  return (
    <main className="min-h-screen bg-mist px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-[0.2em] text-black/45">admin</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Очередь модерации и аудит изменений</h1>
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]"><p className="text-sm text-black/50">Лиды</p><p className="mt-2 font-display text-4xl">{analytics.totalLeads}</p></div>
          <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]"><p className="text-sm text-black/50">Опубликовано объектов</p><p className="mt-2 font-display text-4xl">{analytics.totalPublished}</p></div>
          <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]"><p className="text-sm text-black/50">Владельцев</p><p className="mt-2 font-display text-4xl">{analytics.totalOwners}</p></div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            {pending.map((resort) => (
              <AdminReviewForm key={resort.id} resort={resort} />
            ))}
            <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
              <p className="text-xs uppercase tracking-[0.2em] text-black/45">Отзывы на модерации</p>
              <div className="mt-5 space-y-4">
                {pendingReviews.length ? pendingReviews.map((review) => (
                  <PendingReviewModeration key={review.id} review={review} />
                )) : <p className="text-sm text-black/55">Новых отзывов нет.</p>}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <NotificationsPanel notifications={notifications} title="Операционные сигналы" />
            <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
              <p className="text-xs uppercase tracking-[0.2em] text-black/45">Последние действия</p>
              <div className="mt-6 space-y-4">
                {audit.map((item) => (
                  <div key={item.id} className="rounded-[1.5rem] bg-mist p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-ink">{item.resort.title}</p>
                      <p className="text-xs text-black/45">{new Intl.DateTimeFormat("ru-RU").format(item.createdAt)}</p>
                    </div>
                    <p className="mt-2 text-sm text-black/65">Действие: {item.action}</p>
                    {item.comment && <p className="mt-2 text-sm leading-6 text-black/60">{item.comment}</p>}
                    {item.admin?.name && <p className="mt-2 text-xs uppercase tracking-[0.18em] text-black/40">{item.admin.name}</p>}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
              <p className="text-xs uppercase tracking-[0.2em] text-black/45">Неполные карточки</p>
              <div className="mt-5 space-y-4">
                {incomplete.map((resort) => (
                  <div key={resort.id} className="rounded-[1.5rem] bg-mist p-4">
                    <p className="font-medium text-ink">{resort.title}</p>
                    <p className="mt-2 text-sm text-black/60">{resort.completeness.missing.join(", ")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
