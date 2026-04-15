import { updateLeadAction } from "@/lib/actions";

type LeadCrmFormProps = {
  lead: {
    id: string;
    guestName: string;
    phone: string;
    note?: string;
    ownerComment?: string;
    status: "new" | "contacted" | "no_answer" | "booked" | "closed";
    createdAt: Date;
    resort: { title: string };
  };
};

const statuses = [
  { value: "new", label: "Новый" },
  { value: "contacted", label: "Связались" },
  { value: "no_answer", label: "Не дозвонились" },
  { value: "booked", label: "Бронь подтверждена" },
  { value: "closed", label: "Закрыт" }
] as const;

export function LeadCrmForm({ lead }: LeadCrmFormProps) {
  return (
    <form action={updateLeadAction} className="rounded-[1.5rem] bg-mist p-4">
      <input type="hidden" name="id" value={lead.id} />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-ink">{lead.guestName}</p>
          <p className="mt-1 text-sm text-black/55">{lead.phone}</p>
        </div>
        <p className="text-xs text-black/40">{new Intl.DateTimeFormat("ru-RU").format(lead.createdAt)}</p>
      </div>
      <p className="mt-3 text-sm text-black/55">{lead.resort.title}</p>
      {lead.note && <p className="mt-3 text-sm leading-6 text-black/65">{lead.note}</p>}
      <div className="mt-4 grid gap-3">
        <select
          name="status"
          defaultValue={lead.status}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <textarea
          name="ownerComment"
          defaultValue={lead.ownerComment}
          placeholder="Комментарий менеджера"
          className="min-h-[100px] w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
        />
        <button className="rounded-full bg-pine px-4 py-3 text-sm font-medium text-white">Обновить лид</button>
      </div>
    </form>
  );
}
