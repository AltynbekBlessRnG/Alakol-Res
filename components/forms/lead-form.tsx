import { createLeadAction } from "@/lib/actions";
import { Input, Textarea } from "@/components/ui/input";
import { useId } from "react";

type LeadFormProps = {
  resortId: string;
  id?: string;
};

export function LeadForm({ resortId, id }: LeadFormProps) {
  const guestNameId = useId();
  const phoneId = useId();
  const noteId = useId();

  return (
    <form id={id} action={createLeadAction} className="space-y-4 rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
      <input type="hidden" name="resortId" value={resortId} />
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-black/45">Быстрая заявка</p>
        <h3 className="mt-3 font-display text-3xl text-ink">Уточнить даты и условия</h3>
        <p className="mt-2 text-sm leading-6 text-black/60">Короткая форма без лишних шагов. Подходит для мобильного сценария и быстрого контакта.</p>
      </div>
      <div>
        <label htmlFor={guestNameId} className="mb-2 block text-sm text-black/55">Ваше имя</label>
        <Input id={guestNameId} name="guestName" placeholder="Например, Айгерим" />
      </div>
      <div>
        <label htmlFor={phoneId} className="mb-2 block text-sm text-black/55">Телефон</label>
        <Input id={phoneId} name="phone" placeholder="+7 777 000 00 00" />
      </div>
      <div>
        <label htmlFor={noteId} className="mb-2 block text-sm text-black/55">Комментарий</label>
        <Textarea id={noteId} name="note" placeholder="Интересуют даты, питание, условия для детей..." className="min-h-[120px]" />
      </div>
      <button className="w-full rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">Отправить заявку</button>
    </form>
  );
}
