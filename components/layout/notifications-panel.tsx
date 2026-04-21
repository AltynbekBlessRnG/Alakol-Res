import Link from "next/link";
import type { Notification } from "@/lib/types";

export function NotificationsPanel({ notifications, title = "Уведомления" }: { notifications: Notification[]; title?: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
      <p className="text-xs uppercase tracking-[0.2em] text-black/45">{title}</p>
      <div className="mt-5 space-y-4">
        {notifications.length ? (
          notifications.map((notification) => (
            <div key={notification.id} className="rounded-[1.5rem] bg-mist p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{notification.title}</p>
                  <p className="mt-2 text-sm leading-6 text-black/60">{notification.body}</p>
                </div>
                <p className="text-xs text-black/40">{new Intl.DateTimeFormat("ru-RU").format(notification.createdAt)}</p>
              </div>
              {notification.href && (
                <Link href={notification.href} className="mt-3 inline-flex text-sm font-medium text-pine underline">
                  Открыть
                </Link>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-black/55">Пока уведомлений нет.</p>
        )}
      </div>
    </div>
  );
}
