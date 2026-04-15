import { RESORT_STATUS, Resort, ResortAmenity, ResortImage, ResortPrice, ResortStatus } from "@/lib/demo-data";
import { submitResortForReviewAction, updateResortAction } from "@/lib/actions";
import { ImageUploadPanel } from "@/components/forms/image-upload-panel";
import { Input, Textarea } from "@/components/ui/input";

type OwnerResortFormProps = {
  resort: Resort & { amenities: ResortAmenity[]; prices: ResortPrice[]; images: ResortImage[] };
};

export function OwnerResortForm({ resort }: OwnerResortFormProps) {
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
            <Textarea name="shortDescription" defaultValue={resort.shortDescription} className="min-h-[90px]" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-black/55">Полное описание</label>
            <Textarea name="description" defaultValue={resort.description} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-black/55">Зона</label>
            <Input name="zone" defaultValue={resort.zone} />
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
            <Input name="foodOptions" defaultValue={resort.foodOptions} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-black/55">Тип размещения</label>
            <Input name="accommodationType" defaultValue={resort.accommodationType} />
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
            <label className="mb-2 block text-sm text-black/55">Удобства через запятую</label>
            <Input name="amenities" defaultValue={resort.amenities.map((item) => item.label).join(", ")} />
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
            <Input name="beachLine" defaultValue={resort.beachLine} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-black/55">Трансфер</label>
            <Input name="transferInfo" defaultValue={resort.transferInfo} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-black/55">Фото URL через запятую</label>
            <Textarea
              name="images"
              defaultValue={resort.images.map((item) => item.url).join(", ")}
              className="min-h-[90px]"
              placeholder="Можно оставить пустым и пользоваться загрузкой файлов справа."
            />
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
