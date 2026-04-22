import { submitResortForReviewAction, updateResortAction } from "@/lib/actions";
import { ImageUploadPanel } from "@/components/forms/image-upload-panel";
import { TextareaWithCounter } from "@/components/forms/textarea-with-counter";
import { Input, Textarea } from "@/components/ui/input";
import { getResortCompleteness } from "@/lib/supabase/data";
import { RESORT_STATUS, type Resort, type ResortAmenity, type ResortImage, type ResortPrice, type ResortStatus } from "@/lib/types";

type OwnerResortFormProps = {
  resort: Resort & { amenities: ResortAmenity[]; prices: ResortPrice[]; images: ResortImage[] };
};

const ZONE_OPTIONS = ["Акши", "Коктума", "Кабанбай", "Урджар", "Лепсы"];
const FOOD_OPTIONS = [
  "Без питания",
  "Завтрак включён",
  "Завтрак и ужин",
  "Полный пансион",
  "Кафе на территории",
  "Ресторан и авторское меню"
];
const ACCOMMODATION_OPTIONS = [
  "Стандартные номера",
  "Семейные номера",
  "Коттеджи",
  "Домики у воды",
  "Boutique resort",
  "Глэмпинг",
  "Апартаменты"
];
const BEACH_OPTIONS = [
  "Первая линия, свой выход к воде",
  "Галечно-песчаный берег, 2 минуты пешком",
  "Песчаный пляж, 5 минут пешком",
  "Берег через прогулочную зону",
  "Тихий берег, подходит для спокойного отдыха"
];
const TRANSFER_OPTIONS = [
  "Трансфер не предоставляется",
  "Трансфер по предварительной заявке",
  "Встреча с ЖД вокзала",
  "Трансфер из аэропорта",
  "Помогаем организовать трансфер через партнёров"
];
const AMENITY_OPTIONS = [
  "Wi-Fi",
  "Парковка",
  "Бассейн",
  "Детская зона",
  "BBQ",
  "Террасы",
  "Пляжные лежаки",
  "Кафе",
  "Ресторан",
  "Сауна",
  "Беседки",
  "Анимация",
  "Охраняемая территория",
  "Прачечная"
];

export function OwnerResortForm({ resort }: OwnerResortFormProps) {
  const completeness = getResortCompleteness(resort);
  const selectedAmenities = new Set(resort.amenities.map((item) => item.label));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form action={updateResortAction} className="space-y-5 rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
        <input type="hidden" name="id" value={resort.id} />
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-black/55">Название</label>
            <Input name="title" defaultValue={resort.title} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-black/55">Короткое описание</label>
            <TextareaWithCounter name="shortDescription" defaultValue={resort.shortDescription} minLength={45} className="min-h-[90px]" />
            <p className="mt-2 text-xs leading-5 text-black/45">
              Коротко и по делу: кому подходит место, чем оно привлекает, что там за атмосфера. Желательно от 45 символов.
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-black/55">Полное описание</label>
            <TextareaWithCounter name="description" defaultValue={resort.description} minLength={110} />
            <p className="mt-2 text-xs leading-5 text-black/45">
              Опишите формат отдыха, расстояние до воды, кому подойдёт место, что есть на территории и чем оно отличается. Желательно от 110 символов.
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm text-black/55">Зона</label>
            <Select name="zone" defaultValue={resort.zone} options={ZONE_OPTIONS} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-black/55">Адрес</label>
            <Input name="address" defaultValue={resort.address} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-black/55">Мин. цена</label>
            <Input type="number" name="minPrice" defaultValue={resort.minPrice} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-black/55">Макс. цена</label>
            <Input type="number" name="maxPrice" defaultValue={resort.maxPrice} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-black/55">Питание</label>
            <Select name="foodOptions" defaultValue={resort.foodOptions} options={FOOD_OPTIONS} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-black/55">Тип размещения</label>
            <Select name="accommodationType" defaultValue={resort.accommodationType} options={ACCOMMODATION_OPTIONS} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-black/55">Телефон</label>
            <Input name="contactPhone" defaultValue={resort.contactPhone} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-black/55">WhatsApp</label>
            <Input name="whatsapp" defaultValue={resort.whatsapp} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-black/55">Широта</label>
            <Input type="number" step="0.001" name="latitude" defaultValue={resort.latitude} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-black/55">Долгота</label>
            <Input type="number" step="0.001" name="longitude" defaultValue={resort.longitude} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-black/55">Расстояние до воды, м</label>
            <Input type="number" name="distanceToLakeM" defaultValue={resort.distanceToLakeM} />
          </div>
          <div className="grid gap-3 rounded-[1.5rem] bg-mist p-4">
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="familyFriendly" defaultChecked={resort.familyFriendly} />Семейный формат</label>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="youthFriendly" defaultChecked={resort.youthFriendly} />Для компании</label>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="hasPool" defaultChecked={resort.hasPool} />Бассейн</label>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="hasWifi" defaultChecked={resort.hasWifi} />Wi-Fi</label>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="hasParking" defaultChecked={resort.hasParking} />Парковка</label>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="hasKidsZone" defaultChecked={resort.hasKidsZone} />Детская зона</label>
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-black/55">Удобства</label>
            <div className="grid gap-3 rounded-[1.5rem] bg-mist p-4 sm:grid-cols-2">
              {AMENITY_OPTIONS.map((option) => (
                <label key={option} className="flex items-center gap-3 text-sm text-ink">
                  <input type="checkbox" name="amenities" value={option} defaultChecked={selectedAmenities.has(option)} />
                  {option}
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-black/45">Отметьте только то, что реально есть на территории или в номерах.</p>
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-black/55">Что включено в цену</label>
            <Textarea name="includedText" defaultValue={resort.includedText} className="min-h-[90px]" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-black/55">Правила проживания</label>
            <Textarea name="rulesText" defaultValue={resort.rulesText} className="min-h-[90px]" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-black/55">Берег и пляж</label>
            <Select name="beachLine" defaultValue={resort.beachLine} options={BEACH_OPTIONS} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-black/55">Трансфер</label>
            <Select name="transferInfo" defaultValue={resort.transferInfo} options={TRANSFER_OPTIONS} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-black/55">Цены по строкам</label>
            <Textarea
              name="prices"
              defaultValue={resort.prices.map((price) => `${price.label} | ${price.amount} | ${price.description}`).join("\n")}
              className="min-h-[110px]"
              placeholder={"Стандарт | 28000\nСемейный люкс | 52000 | за номер в сутки\nДомик | 45000"}
            />
            <p className="mt-2 text-xs leading-5 text-black/45">
              Можно писать проще: <strong>название | цена</strong>. Описание необязательно, мы подставим его сами. Также поддерживаются форматы через
              <strong> ; </strong>или <strong> - </strong>.
            </p>
          </div>
          <div className="md:col-span-2 rounded-[1.5rem] bg-mist px-4 py-4 text-sm leading-6 text-black/65">
            Фото теперь лучше загружать через блок справа. После загрузки они сохраняются автоматически и не требуют ручного ввода URL.
          </div>
        </div>
        <button className="rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">Сохранить изменения</button>
      </form>

      <div className="space-y-5">
        <ImageUploadPanel resortId={resort.id} existingImages={resort.images} />
        <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">Статус</p>
          <h3 className="mt-3 font-display text-3xl text-ink">{labelForStatus(resort.status)}</h3>
          <p className="mt-4 text-sm leading-6 text-black/65">
            После отправки на модерацию объект попадёт в очередь суперадмина. Публично в каталоге отображаются только опубликованные карточки.
          </p>
          <div className="mt-5 rounded-[1.5rem] bg-mist p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-black/40">Что нужно для публикации</p>
            {completeness.isReady ? (
              <p className="mt-3 text-sm text-pine">Карточка уже выглядит полной и готовой к модерации.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {completeness.missing.map((item) => (
                  <span key={item} className="rounded-full bg-white px-3 py-2 text-xs text-black/65">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
          {resort.status !== RESORT_STATUS.PUBLISHED && (
            <form action={submitResortForReviewAction} className="mt-6">
              <input type="hidden" name="id" value={resort.id} />
              <button className="rounded-full bg-dune px-5 py-3 text-sm font-medium text-white">Отправить на модерацию</button>
            </form>
          )}
        </div>

        <div className="rounded-[2rem] bg-pine p-6 text-white shadow-glow">
          <p className="text-xs uppercase tracking-[0.2em] text-white/65">Демо доступ</p>
          <p className="mt-4 text-sm leading-6 text-white/78">
            Владелец: <strong>owner@alakol.kz</strong> / <strong>owner123</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

function labelForStatus(status: ResortStatus) {
  switch (status) {
    case "DRAFT":
      return "Черновик";
    case "PENDING_REVIEW":
      return "На модерации";
    case "PUBLISHED":
      return "Опубликован";
    case "REJECTED":
      return "Требует доработки";
  }
}

function Select({ name, defaultValue, options }: { name: string; defaultValue?: string; options: string[] }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-lake focus:ring-2 focus:ring-lake/20"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
