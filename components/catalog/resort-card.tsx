import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Waves, Wifi } from "lucide-react";
import { ResortAmenity, ResortImage, ResortWithRelations } from "@/lib/demo-data";
import { formatPrice } from "@/lib/utils";

type ResortCardProps = {
  resort: ResortWithRelations & { images: ResortImage[]; amenities: ResortAmenity[] };
};

export function ResortCard({ resort }: ResortCardProps) {
  const image = resort.images[0];

  return (
    <Link
      href={`/catalog/${resort.slug}`}
      className="group overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_70px_rgba(14,26,31,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_90px_rgba(14,26,31,0.14)]"
    >
      <div className="relative h-72 overflow-hidden">
        {image && (
          <Image src={image.url} alt={image.alt} fill className="object-cover transition duration-500 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">{resort.zone}</p>
            <h3 className="mt-2 font-display text-2xl">{resort.title}</h3>
          </div>
          <div className="rounded-full bg-white/12 px-4 py-2 text-sm backdrop-blur-sm">
            от {formatPrice(resort.minPrice)} ₸
          </div>
        </div>
      </div>
      <div className="space-y-4 p-6">
        <p className="text-sm leading-6 text-black/65">{resort.shortDescription}</p>
        {resort.approvedReviewsCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-ink">
            <Star size={16} className="fill-[#d49b35] text-[#d49b35]" />
            <span>{resort.ratingAverage}</span>
            <span className="text-black/50">· {resort.approvedReviewsCount} отзывов</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2 text-xs text-black/70">
          {resort.amenities.slice(0, 4).map((amenity) => (
            <span key={amenity.id} className="rounded-full bg-mist px-3 py-2">
              {amenity.label}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-black/58">
          <span className="flex items-center gap-2">
            <MapPin size={16} />
            {resort.distanceToLakeM} м до воды
          </span>
          <span className="flex items-center gap-2">
            <Waves size={16} />
            {resort.foodOptions}
          </span>
          {resort.hasWifi && (
            <span className="flex items-center gap-2">
              <Wifi size={16} />
              Wi-Fi
            </span>
          )}
        </div>
        <div className="pt-2 text-sm font-medium text-pine">Открыть карточку</div>
      </div>
    </Link>
  );
}
