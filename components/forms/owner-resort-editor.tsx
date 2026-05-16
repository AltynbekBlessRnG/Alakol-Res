"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  BedDouble,
  Camera,
  CheckCircle2,
  ChevronDown,
  ImagePlus,
  MapPin,
  Pencil,
  PhoneCall,
  Save,
  Send,
  Sparkles
} from "lucide-react";
import { ImageUploadPanel } from "@/components/forms/image-upload-panel";
import { formatPrice } from "@/lib/utils";
import { RESORT_STATUS, type Resort, type ResortAmenity, type ResortImage, type ResortPrice, type ResortStatus } from "@/lib/types";

type ResortEditorProps = {
  resort: Resort & { amenities: ResortAmenity[]; prices: ResortPrice[]; images: ResortImage[] };
  completeness: { isReady: boolean; missing: string[] };
  error?: string;
  updateAction: (formData: FormData) => void | Promise<void>;
  submitAction: (formData: FormData) => void | Promise<void>;
};

type Draft = {
  title: string;
  shortDescription: string;
  description: string;
  zone: string;
  address: string;
  minPrice: string;
  maxPrice: string;
  foodOptions: string;
  contactPhone: string;
  whatsapp: string;
  latitude: string;
  longitude: string;
  distanceToLakeM: string;
  includedOther: string;
  rulesText: string;
  beachLine: string;
  transferInfo: string;
  pricesText: string;
};

const ZONE_OPTIONS = ["Акши", "Коктума", "Кабанбай", "Урджар", "Лепсы", "Алаколь"];
const FOOD_OPTIONS = ["Без питания", "Завтрак включен", "Завтрак и ужин", "Полный пансион", "Кафе на территории", "Ресторан"];
const ACCOMMODATION_OPTIONS = ["Стандартные номера", "Семейные номера", "Коттеджи", "Домики у воды", "Глэмпинг", "Апартаменты"];
const AUDIENCE_OPTIONS = ["Семьям", "С детьми", "Парам", "Компаниям", "Тихий отдых"];
const AMENITY_OPTIONS = ["Wi-Fi", "Парковка", "Бассейн", "Детская зона", "BBQ", "Террасы", "Пляжные лежаки", "Кафе", "Ресторан", "Сауна", "Беседки", "Анимация", "Охраняемая территория", "Прачечная"];
const INCLUDED_OPTIONS = ["проживание", "завтрак", "парковка", "Wi-Fi", "бассейн", "лежаки", "детская зона", "трансфер"];
const BEACH_OPTIONS = [
  "Первая линия, свой выход к воде",
  "Галечно-песчаный берег, 2 минуты пешком",
  "Песчаный пляж, 5 минут пешком",
  "Берег через прогулочную зону",
  "Тихий берег для спокойного отдыха"
];
const TRANSFER_OPTIONS = [
  "Трансфер не предоставляется",
  "Трансфер по предварительной заявке",
  "Встреча с ЖД вокзала",
  "Трансфер из аэропорта",
  "Помогаем организовать трансфер"
];

export function OwnerResortEditor({ resort, completeness, error, updateAction, submitAction }: ResortEditorProps) {
  const cover = resort.images.find((image) => image.isCover || image.kind === "cover") ?? resort.images[0];
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(() => ({
    title: resort.title || "",
    shortDescription: resort.shortDescription || "",
    description: resort.description || "",
    zone: resort.zone || "Алаколь",
    address: resort.address || "",
    minPrice: String(resort.minPrice || ""),
    maxPrice: String(resort.maxPrice || ""),
    foodOptions: resort.foodOptions || "Без питания",
    contactPhone: resort.contactPhone || "",
    whatsapp: resort.whatsapp || "",
    latitude: String(resort.latitude || 46.1),
    longitude: String(resort.longitude || 81.6),
    distanceToLakeM: String(resort.distanceToLakeM || ""),
    includedOther: "",
    rulesText: resort.rulesText || "",
    beachLine: resort.beachLine || "",
    transferInfo: resort.transferInfo || "",
    pricesText: resort.prices.map((price) => `${price.label} | ${price.amount} | ${price.description}`).join("\n")
  }));
  const [amenities, setAmenities] = useState(() => unique([
    ...resort.amenities.map((item) => item.label),
    ...(resort.hasWifi ? ["Wi-Fi"] : []),
    ...(resort.hasParking ? ["Парковка"] : []),
    ...(resort.hasPool ? ["Бассейн"] : []),
    ...(resort.hasKidsZone ? ["Детская зона"] : [])
  ]));
  const [audience, setAudience] = useState(() => unique([
    ...(resort.familyFriendly ? ["Семьям"] : []),
    ...(resort.hasKidsZone ? ["С детьми"] : []),
    ...(resort.youthFriendly ? ["Компаниям"] : [])
  ]));
  const [accommodationTypes, setAccommodationTypes] = useState(() => {
    const found = ACCOMMODATION_OPTIONS.filter((option) => resort.accommodationType.toLowerCase().includes(option.toLowerCase()));
    return found.length ? found : resort.accommodationType ? [resort.accommodationType] : [];
  });
  const [includedItems, setIncludedItems] = useState(() =>
    INCLUDED_OPTIONS.filter((option) => resort.includedText.toLowerCase().includes(option.toLowerCase()))
  );

  const title = draft.title.trim() || "Без названия";
  const shortDescription = draft.shortDescription.trim() || "Нет описания";
  const fullDescription = draft.description.trim() || draft.shortDescription.trim() || "Нет описания";
  const minPrice = Number(draft.minPrice) || 0;
  const maxPrice = Number(draft.maxPrice) || minPrice || 0;
  const distance = Number(draft.distanceToLakeM) || 0;
  const idealFor = audience.length ? audience.join(", ") : "укажите формат отдыха";
  const accommodationText = accommodationTypes.length ? accommodationTypes.join(", ") : "укажите варианты размещения";
  const includedText = [...includedItems, draft.includedOther].filter(Boolean).join(", ");
  const priceRows = useMemo(() => parsePrices(draft.pricesText), [draft.pricesText]);

  const setField = (field: keyof Draft, value: string) => setDraft((current) => ({ ...current, [field]: value }));

  return (
    <div className="bg-[#f7f1e6] pb-24 text-ink">
      <form id="owner-resort-editor-form" action={updateAction} className="hidden">
        <HiddenInputs
          resortId={resort.id}
          draft={draft}
          amenities={amenities}
          audience={audience}
          accommodationTypes={accommodationTypes}
          includedItems={includedItems}
          title={title}
          maxPrice={maxPrice}
          minPrice={minPrice}
          includedText={includedText}
        />
      </form>

      {error && (
        <div className="mx-auto max-w-7xl px-4 pt-6 md:px-8">
          <p className="rounded-[1.25rem] bg-[#f7d7d7] px-4 py-3 text-sm text-[#8f2c2c]">
            Для отправки на проверку не хватает: {error}
          </p>
        </div>
      )}

      <section className="relative overflow-hidden bg-black text-white">
        {cover && <Image src={cover.url} alt={cover.alt} fill priority className="object-cover opacity-55" />}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.86)),radial-gradient(circle_at_top_left,rgba(212,155,53,0.18),transparent_34%)]" />
        <div className="relative mx-auto flex min-h-[590px] max-w-7xl flex-col justify-between px-4 pb-10 pt-8 md:min-h-[680px] md:px-8 md:pb-14">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
              <Sparkles size={16} />
              Живое редактирование
            </div>
            <button
              form="owner-resort-editor-form"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-ink transition hover:bg-white/90"
            >
              <Save size={16} />
              Сохранить
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <EditableSelect
                id="zone"
                label="Зона"
                value={draft.zone}
                options={ZONE_OPTIONS}
                editing={editing}
                setEditing={setEditing}
                onChange={(value) => setField("zone", value)}
                dark
              />
              <EditableText
                id="title"
                label="Название"
                value={draft.title}
                fallback="Без названия"
                editing={editing}
                setEditing={setEditing}
                onChange={(value) => setField("title", value)}
                dark
                title
              />
              <EditableText
                id="shortDescription"
                label="Короткое описание"
                value={draft.shortDescription}
                fallback="Нет описания"
                editing={editing}
                setEditing={setEditing}
                onChange={(value) => setField("shortDescription", value)}
                dark
                multiline
              />
              <div className="mt-6 flex flex-wrap gap-2 text-sm md:gap-3">
                <HeroChip id="minPrice" label={`от ${formatPrice(minPrice)} ₸ / сутки`} setEditing={setEditing} />
                <HeroChip id="distanceToLakeM" label={distance ? `${distance} м до воды` : "до воды не указано"} setEditing={setEditing} />
                <HeroChip id="foodOptions" label={draft.foodOptions || "питание не указано"} setEditing={setEditing} />
              </div>
            </div>

            <div className="grid gap-2 rounded-[1.35rem] border border-white/12 bg-white/10 p-3 backdrop-blur-md md:grid-cols-2 md:gap-3 md:rounded-[2rem] md:p-5">
              <GlassStat id="audience" label="Кому подойдет" value={idealFor} setEditing={setEditing} />
              <GlassStat id="distanceToLakeM" label="До воды" value={distance ? `${distance} м до берега` : "укажите расстояние"} setEditing={setEditing} />
              <GlassStat id="beachLine" label="Берег" value={draft.beachLine || "укажите берег"} setEditing={setEditing} />
              <GlassStat id="minPrice" label="Что по цене" value={minPrice ? `от ${formatPrice(minPrice)} ₸` : "укажите цену"} setEditing={setEditing} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-8 md:py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5 md:space-y-8">
          <EditPanel editing={editing} draft={draft} setField={setField} setEditing={setEditing} />

          <div className="rounded-[1.35rem] bg-white p-5 shadow-[0_14px_42px_rgba(14,26,31,0.08)] md:rounded-[2rem] md:p-8">
            <SectionTitle icon={<Camera size={17} />} label="Галерея" action="Фото управляются справа" />
            {resort.images.length ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {resort.images.slice(0, 6).map((image) => (
                  <div key={image.id} className="relative h-44 overflow-hidden rounded-[1.35rem] bg-black">
                    <Image src={image.url} alt={image.alt} fill className="object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 flex min-h-56 flex-col items-center justify-center rounded-[1.35rem] bg-black p-6 text-center text-white">
                <ImagePlus size={34} />
                <p className="mt-3 text-lg font-medium">Фото пока нет</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/62">Загрузите cover-фото и еще несколько снимков в блоке справа.</p>
              </div>
            )}
          </div>

          <EditableCard
            id="description"
            icon={<BedDouble size={17} />}
            title="О месте"
            value={fullDescription}
            setEditing={setEditing}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <PreviewListCard id="amenities" title="Удобства" empty="Добавьте удобства" items={amenities} setEditing={setEditing} />
            <PreviewListCard id="accommodation" title="Размещение" empty="Добавьте типы размещения" items={accommodationTypes} setEditing={setEditing} />
          </div>

          <div className="rounded-[1.35rem] bg-white p-5 shadow-[0_14px_42px_rgba(14,26,31,0.08)] md:rounded-[2rem] md:p-8">
            <SectionTitle label="Цены и варианты" action="Редактировать" onClick={() => setEditing("pricesText")} />
            <div className="mt-6 grid gap-4">
              {priceRows.length ? priceRows.map((price) => (
                <button key={`${price.label}-${price.amount}`} type="button" onClick={() => setEditing("pricesText")} className="flex flex-col gap-2 rounded-[1.5rem] bg-[#f7f1e6] px-5 py-4 text-left md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-medium text-ink">{price.label}</p>
                    <p className="text-sm text-black/55">{price.description || "за номер в сутки"}</p>
                  </div>
                  <p className="text-lg font-medium text-pine">{formatPrice(price.amount)} ₸</p>
                </button>
              )) : (
                <button type="button" onClick={() => setEditing("pricesText")} className="rounded-[1.5rem] bg-[#f7f1e6] px-5 py-5 text-left text-sm text-black/58">
                  Добавьте цены: например “Стандарт | 28000 | за номер в сутки”.
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <PreviewFactCard id="included" title="Что включено" value={includedText || "Укажите, что входит в цену"} setEditing={setEditing} />
            <PreviewFactCard id="rulesText" title="Правила" value={draft.rulesText || "Укажите время заезда и важные правила"} setEditing={setEditing} />
            <PreviewFactCard id="beachLine" title="Берег" value={draft.beachLine || "Укажите тип берега"} setEditing={setEditing} />
            <PreviewFactCard id="transferInfo" title="Трансфер" value={draft.transferInfo || "Укажите условия трансфера"} setEditing={setEditing} />
          </div>

          <div className="rounded-[1.35rem] bg-white p-5 shadow-[0_14px_42px_rgba(14,26,31,0.08)] md:rounded-[2rem] md:p-8">
            <SectionTitle icon={<MapPin size={17} />} label="Контакты и адрес" action="Редактировать" onClick={() => setEditing("contacts")} />
            <div className="mt-5 grid gap-3 rounded-[1.5rem] bg-[#f7f1e6] p-4 text-sm leading-7 text-black/64">
              <p><strong>Адрес:</strong> {draft.address || "не указан"}</p>
              <p><strong>Телефон:</strong> {draft.contactPhone || "не указан"}</p>
              <p><strong>WhatsApp:</strong> {draft.whatsapp || "не указан"}</p>
              <p><strong>Координаты:</strong> {draft.latitude}, {draft.longitude}</p>
            </div>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.35rem] bg-white p-5 shadow-[0_14px_42px_rgba(14,26,31,0.08)] md:rounded-[2rem] md:p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-black/45">Панель владельца</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">{labelForStatus(resort.status)}</h2>
            <p className="mt-3 text-sm leading-6 text-black/60">Сначала сохраните изменения. Когда карточка будет заполнена, отправьте ее на проверку.</p>
            <SaveButton />
            <div className="mt-5 rounded-[1.5rem] bg-[#f7f1e6] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-ink">
                <CheckCircle2 size={16} />
                Готовность
              </div>
              {completeness.isReady ? (
                <p className="mt-3 text-sm text-pine">Карточка готова к проверке.</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {completeness.missing.map((item) => (
                    <span key={item} className="rounded-full bg-white px-3 py-2 text-xs text-black/65">{item}</span>
                  ))}
                </div>
              )}
            </div>
            {resort.status !== RESORT_STATUS.PUBLISHED && (
              <form action={submitAction} className="mt-5">
                <input type="hidden" name="id" value={resort.id} />
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-dune px-5 py-3 text-sm font-medium text-white">
                  <Send size={16} />
                  Отправить на проверку
                </button>
              </form>
            )}
          </div>

          <ImageUploadPanel resortId={resort.id} existingImages={resort.images} />
        </aside>
      </section>

      {editing === "amenities" && <ChoiceDrawer title="Удобства" options={AMENITY_OPTIONS} selected={amenities} setSelected={setAmenities} onClose={() => setEditing(null)} />}
      {editing === "audience" && <ChoiceDrawer title="Кому подходит" options={AUDIENCE_OPTIONS} selected={audience} setSelected={setAudience} onClose={() => setEditing(null)} />}
      {editing === "accommodation" && <ChoiceDrawer title="Типы размещения" options={ACCOMMODATION_OPTIONS} selected={accommodationTypes} setSelected={setAccommodationTypes} onClose={() => setEditing(null)} />}
      {editing === "included" && <ChoiceDrawer title="Что включено в цену" options={INCLUDED_OPTIONS} selected={includedItems} setSelected={setIncludedItems} onClose={() => setEditing(null)} extraValue={draft.includedOther} onExtraChange={(value) => setField("includedOther", value)} />}
    </div>
  );
}

function HiddenInputs({
  resortId,
  draft,
  amenities,
  audience,
  accommodationTypes,
  includedItems,
  title,
  minPrice,
  maxPrice,
  includedText
}: {
  resortId: string;
  draft: Draft;
  amenities: string[];
  audience: string[];
  accommodationTypes: string[];
  includedItems: string[];
  title: string;
  minPrice: number;
  maxPrice: number;
  includedText: string;
}) {
  return (
    <>
      <input name="id" value={resortId} readOnly />
      <input name="title" value={title} readOnly />
      <input name="shortDescription" value={draft.shortDescription} readOnly />
      <input name="description" value={draft.description} readOnly />
      <input name="zone" value={draft.zone || "Алаколь"} readOnly />
      <input name="address" value={draft.address} readOnly />
      <input name="minPrice" value={minPrice} readOnly />
      <input name="maxPrice" value={maxPrice || minPrice} readOnly />
      <input name="foodOptions" value={draft.foodOptions || "Без питания"} readOnly />
      <input name="accommodationType" value={accommodationTypes.join(", ") || "Разные варианты размещения"} readOnly />
      <input name="contactPhone" value={draft.contactPhone} readOnly />
      <input name="whatsapp" value={draft.whatsapp} readOnly />
      <input name="latitude" value={draft.latitude || "46.1"} readOnly />
      <input name="longitude" value={draft.longitude || "81.6"} readOnly />
      <input name="distanceToLakeM" value={draft.distanceToLakeM || "0"} readOnly />
      <input name="includedText" value={includedText} readOnly />
      <input name="includedOther" value={draft.includedOther} readOnly />
      <input name="rulesText" value={draft.rulesText} readOnly />
      <input name="beachLine" value={draft.beachLine} readOnly />
      <input name="transferInfo" value={draft.transferInfo} readOnly />
      <textarea name="prices" value={draft.pricesText} readOnly />
      {amenities.map((item) => <input key={`amenity-${item}`} name="amenities" value={item} readOnly />)}
      {audience.map((item) => <input key={`audience-${item}`} name="audience" value={item} readOnly />)}
      {accommodationTypes.map((item) => <input key={`accommodation-${item}`} name="accommodationTypes" value={item} readOnly />)}
      {includedItems.map((item) => <input key={`included-${item}`} name="includedItems" value={item} readOnly />)}
    </>
  );
}

function EditPanel({ editing, draft, setField, setEditing }: {
  editing: string | null;
  draft: Draft;
  setField: (field: keyof Draft, value: string) => void;
  setEditing: (field: string | null) => void;
}) {
  if (!editing || ["amenities", "audience", "accommodation", "included"].includes(editing)) return null;
  const common = "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-lake focus:ring-2 focus:ring-lake/20";
  const close = <button type="button" onClick={() => setEditing(null)} className="rounded-full bg-pine px-4 py-2 text-sm font-medium text-white">Готово</button>;

  if (editing === "contacts") {
    return (
      <div className="rounded-[1.35rem] bg-white p-5 shadow-[0_14px_42px_rgba(14,26,31,0.08)] md:rounded-[2rem] md:p-6">
        <div className="mb-4 flex items-center justify-between gap-4"><h3 className="text-xl font-semibold">Контакты и адрес</h3>{close}</div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextControl label="Адрес" value={draft.address} onChange={(value) => setField("address", value)} placeholder="поселок Акши, первая линия" />
          <TextControl label="Телефон" value={draft.contactPhone} onChange={(value) => setField("contactPhone", value)} placeholder="+7 705 123 45 67" />
          <TextControl label="WhatsApp" value={draft.whatsapp} onChange={(value) => setField("whatsapp", value)} placeholder="77051234567" />
          <TextControl label="Широта" value={draft.latitude} onChange={(value) => setField("latitude", value)} placeholder="46.163" />
          <TextControl label="Долгота" value={draft.longitude} onChange={(value) => setField("longitude", value)} placeholder="81.633" />
        </div>
      </div>
    );
  }

  if (editing === "pricesText") {
    return (
      <div className="rounded-[1.35rem] bg-white p-5 shadow-[0_14px_42px_rgba(14,26,31,0.08)] md:rounded-[2rem] md:p-6">
        <div className="mb-4 flex items-center justify-between gap-4"><h3 className="text-xl font-semibold">Цены</h3>{close}</div>
        <textarea className={`${common} min-h-36`} value={draft.pricesText} onChange={(event) => setField("pricesText", event.target.value)} placeholder={"Стандарт | 28000 | за номер в сутки\nКоттедж | 65000 | до 6 гостей"} />
      </div>
    );
  }

  const numberFields: Partial<Record<keyof Draft, string>> = {
    minPrice: "Минимальная цена",
    maxPrice: "Максимальная цена",
    distanceToLakeM: "Расстояние до воды"
  };
  const selectFields: Partial<Record<keyof Draft, { label: string; options: string[] }>> = {
    foodOptions: { label: "Питание", options: FOOD_OPTIONS },
    beachLine: { label: "Берег", options: BEACH_OPTIONS },
    transferInfo: { label: "Трансфер", options: TRANSFER_OPTIONS }
  };

  if (editing in numberFields) {
    const field = editing as keyof Draft;
    return <SinglePanel title={numberFields[field] || "Значение"} onClose={() => setEditing(null)}><input type="number" className={common} value={draft[field]} onChange={(event) => setField(field, event.target.value)} /></SinglePanel>;
  }

  if (editing in selectFields) {
    const field = editing as keyof Draft;
    const config = selectFields[field]!;
    return (
      <SinglePanel title={config.label} onClose={() => setEditing(null)}>
        <select className={common} value={draft[field]} onChange={(event) => setField(field, event.target.value)}>
          <option value="">Не указано</option>
          {config.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </SinglePanel>
    );
  }

  if (editing === "rulesText") {
    return <SinglePanel title="Правила" onClose={() => setEditing(null)}><textarea className={`${common} min-h-28`} value={draft.rulesText} onChange={(event) => setField("rulesText", event.target.value)} placeholder="Заезд после 14:00, выезд до 12:00" /></SinglePanel>;
  }

  if (editing === "description") {
    return (
      <SinglePanel title="Описание" onClose={() => setEditing(null)}>
        <textarea
          className={`${common} min-h-40`}
          value={draft.description}
          onChange={(event) => setField("description", event.target.value)}
          placeholder="Напишите 2-3 предложения: кому подойдет место, что есть на территории, как далеко до воды."
        />
      </SinglePanel>
    );
  }

  return null;
}

function EditableText({ id, label, value, fallback, editing, setEditing, onChange, dark, title, multiline }: {
  id: string;
  label: string;
  value: string;
  fallback: string;
  editing: string | null;
  setEditing: (field: string | null) => void;
  onChange: (value: string) => void;
  dark?: boolean;
  title?: boolean;
  multiline?: boolean;
}) {
  const isEditing = editing === id;
  const baseInput = dark ? "border-white/20 bg-white/10 text-white placeholder:text-white/45 focus:border-white/55" : "border-black/10 bg-white text-ink";
  if (isEditing) {
    const className = `mt-3 w-full rounded-[1.35rem] border px-4 py-3 outline-none ${baseInput} ${title ? "text-4xl font-semibold md:text-6xl" : "text-base leading-7"}`;
    return multiline ? (
      <textarea autoFocus className={`${className} min-h-28`} value={value} onChange={(event) => onChange(event.target.value)} onBlur={() => setEditing(null)} placeholder={fallback} />
    ) : (
      <input autoFocus className={className} value={value} onChange={(event) => onChange(event.target.value)} onBlur={() => setEditing(null)} placeholder={fallback} />
    );
  }
  return (
    <button type="button" onClick={() => setEditing(id)} className="group mt-3 block max-w-4xl text-left">
      <span className={title ? "text-4xl font-semibold leading-[0.96] md:text-6xl xl:text-7xl" : "text-base leading-7 text-white/78 md:text-lg md:leading-8"}>
        {value.trim() || fallback}
      </span>
      <span className="ml-3 inline-flex translate-y-1 rounded-full bg-white/12 p-2 text-white/70 transition group-hover:bg-white/22 group-hover:text-white" aria-label={`Редактировать ${label}`}>
        <Pencil size={16} />
      </span>
    </button>
  );
}

function EditableSelect({ id, label, value, options, editing, setEditing, onChange }: {
  id: string;
  label: string;
  value: string;
  options: string[];
  editing: string | null;
  setEditing: (field: string | null) => void;
  onChange: (value: string) => void;
  dark?: boolean;
}) {
  if (editing === id) {
    return (
      <select autoFocus value={value} onChange={(event) => onChange(event.target.value)} onBlur={() => setEditing(null)} className="rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white outline-none">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    );
  }
  return (
    <button type="button" onClick={() => setEditing(id)} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/60">
      {value || label}
      <Pencil size={13} />
    </button>
  );
}

function HeroChip({ id, label, setEditing }: { id: string; label: string; setEditing: (field: string) => void }) {
  return (
    <button type="button" onClick={() => setEditing(id)} className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2.5 text-white backdrop-blur-sm transition hover:bg-white/20 md:py-3">
      {label}
      <Pencil size={14} />
    </button>
  );
}

function GlassStat({ id, label, value, setEditing }: { id: string; label: string; value: string; setEditing: (field: string) => void }) {
  return (
    <button type="button" onClick={() => setEditing(id)} className="rounded-[1rem] bg-white/8 p-3 text-left transition hover:bg-white/14 md:rounded-[1.5rem] md:p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/55 md:text-xs md:tracking-[0.2em]">{label}</p>
      <p className="mt-2 flex items-start gap-2 text-sm leading-5 text-white md:mt-3 md:text-lg">
        {value}
        <Pencil size={14} className="mt-1 shrink-0 text-white/55" />
      </p>
    </button>
  );
}

function EditableCard({ id, icon, title, value, setEditing }: { id: string; icon?: React.ReactNode; title: string; value: string; setEditing: (field: string) => void }) {
  return (
    <div className="rounded-[1.35rem] bg-white p-5 shadow-[0_14px_42px_rgba(14,26,31,0.08)] md:rounded-[2rem] md:p-8">
      <SectionTitle icon={icon} label={title} action="Редактировать" onClick={() => setEditing(id)} />
      <button type="button" onClick={() => setEditing(id)} className="mt-5 block max-w-3xl text-left text-base leading-8 text-black/72">
        {value}
        <Pencil size={15} className="ml-2 inline text-black/35" />
      </button>
    </div>
  );
}

function PreviewListCard({ id, title, empty, items, setEditing }: { id: string; title: string; empty: string; items: string[]; setEditing: (field: string) => void }) {
  return (
    <div className="rounded-[1.35rem] bg-white p-5 shadow-[0_14px_42px_rgba(14,26,31,0.08)] md:rounded-[2rem] md:p-8">
      <SectionTitle label={title} action="Изменить" onClick={() => setEditing(id)} />
      <div className="mt-5 flex flex-wrap gap-2">
        {items.length ? items.map((item) => <button key={item} type="button" onClick={() => setEditing(id)} className="rounded-full bg-[#f7f1e6] px-4 py-3 text-sm">{item}</button>) : (
          <button type="button" onClick={() => setEditing(id)} className="rounded-full bg-[#f7f1e6] px-4 py-3 text-sm text-black/55">{empty}</button>
        )}
      </div>
    </div>
  );
}

function PreviewFactCard({ id, title, value, setEditing }: { id: string; title: string; value: string; setEditing: (field: string) => void }) {
  return (
    <button type="button" onClick={() => setEditing(id)} className="rounded-[1.35rem] bg-white p-5 text-left shadow-[0_14px_42px_rgba(14,26,31,0.08)] md:rounded-[2rem] md:p-7">
      <p className="text-xs uppercase tracking-[0.18em] text-black/42">{title}</p>
      <p className="mt-3 text-sm leading-7 text-black/68">{value}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-pine"><Pencil size={14} /> Изменить</span>
    </button>
  );
}

function ChoiceDrawer({ title, options, selected, setSelected, onClose, extraValue, onExtraChange }: {
  title: string;
  options: string[];
  selected: string[];
  setSelected: (items: string[]) => void;
  onClose: () => void;
  extraValue?: string;
  onExtraChange?: (value: string) => void;
}) {
  const toggle = (option: string) => setSelected(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-[2rem] bg-white p-5 shadow-[0_-22px_70px_rgba(14,26,31,0.18)] md:left-auto md:right-6 md:bottom-6 md:w-[430px] md:rounded-[2rem]">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-ink">{title}</h3>
        <button type="button" onClick={onClose} className="rounded-full bg-pine px-4 py-2 text-sm font-medium text-white">Готово</button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-1">
        {options.map((option) => (
          <button key={option} type="button" onClick={() => toggle(option)} className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition ${selected.includes(option) ? "bg-pine text-white" : "bg-[#f7f1e6] text-ink"}`}>
            {option}
            {selected.includes(option) && <CheckCircle2 size={16} />}
          </button>
        ))}
      </div>
      {onExtraChange && (
        <input value={extraValue || ""} onChange={(event) => onExtraChange(event.target.value)} placeholder="Другое, через запятую" className="mt-4 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-lake focus:ring-2 focus:ring-lake/20" />
      )}
    </div>
  );
}

function SectionTitle({ icon, label, action, onClick }: { icon?: React.ReactNode; label: string; action?: string; onClick?: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-pine">
        {icon}
        <h2 className="text-2xl font-semibold text-ink md:text-3xl">{label}</h2>
      </div>
      {action && (
        <button type="button" onClick={onClick} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f7f1e6] px-4 py-2 text-sm font-medium text-pine">
          {action}
          <Pencil size={14} />
        </button>
      )}
    </div>
  );
}

function SinglePanel({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="rounded-[1.35rem] bg-white p-5 shadow-[0_14px_42px_rgba(14,26,31,0.08)] md:rounded-[2rem] md:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <button type="button" onClick={onClose} className="rounded-full bg-pine px-4 py-2 text-sm font-medium text-white">Готово</button>
      </div>
      {children}
    </div>
  );
}

function TextControl({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block text-sm text-black/55">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-lake focus:ring-2 focus:ring-lake/20" />
    </label>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button form="owner-resort-editor-form" disabled={pending} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-pine px-5 py-3 text-sm font-medium text-white disabled:opacity-60">
      <Save size={16} />
      {pending ? "Сохраняем..." : "Сохранить изменения"}
    </button>
  );
}

function parsePrices(value: string) {
  return value
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [label = "", rawAmount = "", description = ""] = row.split("|").map((item) => item.trim());
      const amount = Number(rawAmount.replace(/[^\d]/g, ""));
      return { label, amount, description };
    })
    .filter((item) => item.label && Number.isFinite(item.amount) && item.amount > 0);
}

function labelForStatus(status: ResortStatus) {
  switch (status) {
    case "DRAFT":
      return "Черновик";
    case "PENDING_REVIEW":
      return "На проверке";
    case "PUBLISHED":
      return "Опубликован";
    case "REJECTED":
      return "Нужны правки";
  }
}

function unique(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}
