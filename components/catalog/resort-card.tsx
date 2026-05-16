import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Waves, Wifi } from "lucide-react";
import { PublicActions } from "@/components/catalog/public-actions";
import type { ResortAmenity, ResortImage, ResortWithRelations } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

type ResortCardProps = {
  resort: ResortWithRelations & { images: ResortImage[]; amenities: ResortAmenity[] };
};

export function ResortCard({ resort }: ResortCardProps) {
  const image = resort.images[0];

  return (
    <article className="group relative overflow-hidden rounded-[1.35rem] border border-black/8 bg-white shadow-[0_12px_36px_rgba(14,26,31,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(14,26,31,0.14)]">
      <Link href={`/catalog/${resort.slug}`} className="absolute inset-0 z-10" aria-label={`Открыть ${resort.title}`} />

      <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative h-52 overflow-hidden bg-mist md:h-full md:min-h-[245px] xl:h-56 2xl:h-full">
          {image && (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 420px"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/64 via-black/8 to-transparent" />
          <div className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1.5 text-xs font-semibold text-ink backdrop-blur">
            {resort.zone}
          </div>
          {resort.approvedReviewsCount > 0 && (
            <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
              <Star size={13} className="fill-[#f2c45b] text-[#f2c45b]" />
              {resort.ratingAverage}
            </div>
          )}
        </div>

        <div className="pointer-events-none relative z-20 flex min-w-0 flex-col gap-4 p-4 md:p-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-semibold leading-tight text-ink md:text-2xl">{resort.title}</h3>
              <p className="shrink-0 rounded-full bg-[#edf6f2] px-3 py-1.5 text-sm font-semibold text-pine">
                от {formatPrice(resort.minPrice)} ₸
              </p>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-black/62">{resort.shortDescription}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-black/62">
            <span className="flex items-center gap-2 rounded-2xl bg-mist px-3 py-2">
              <MapPin size={14} />
              {resort.distanceToLakeM} м
            </span>
            <span className="flex items-center gap-2 rounded-2xl bg-mist px-3 py-2">
              <Waves size={14} />
              {resort.foodOptions}
            </span>
            {resort.hasWifi && (
              <span className="flex items-center gap-2 rounded-2xl bg-mist px-3 py-2">
                <Wifi size={14} />
                Wi-Fi
              </span>
            )}
            {resort.amenities[0] && (
              <span className="truncate rounded-2xl bg-mist px-3 py-2">{resort.amenities[0].label}</span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-black/8 pt-3">
            <span className="text-sm font-medium text-pine">Открыть карточку</span>
            <div className="pointer-events-auto relative z-30">
              <PublicActions slug={resort.slug} title={resort.title} compact />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
