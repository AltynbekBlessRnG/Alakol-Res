 "use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

type ResortGalleryImage = {
  id: string;
  url: string;
  alt: string;
};

export function ResortGallery({ images }: { images: ResortGalleryImage[] }) {
  if (!images.length) return null;
  const normalizedImages = useMemo(
    () => images.map((image, index) => ({ ...image, alt: image.alt?.trim() || `Фото ${index + 1}` })),
    [images]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = normalizedImages[activeIndex] ?? normalizedImages[0];

  function goTo(index: number) {
    const nextIndex = (index + normalizedImages.length) % normalizedImages.length;
    setActiveIndex(nextIndex);
  }

  return (
    <section className="rounded-[2.2rem] bg-white p-5 shadow-[0_18px_70px_rgba(14,26,31,0.08)] md:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/40">Галерея</p>
          <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">Посмотрите, как выглядит зона отдыха</h2>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            className="interactive-surface inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-ink"
            aria-label="Предыдущее фото"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="interactive-surface inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-ink"
            aria-label="Следующее фото"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[2rem] bg-[#f7f1e6]">
        <div className="relative aspect-[1.1] md:aspect-[1.7]">
          <Image
            key={activeImage.id}
            src={activeImage.url}
            alt={activeImage.alt}
            fill
            className="object-cover transition duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 md:hidden">
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="interactive-surface inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="interactive-surface inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm"
              aria-label="Следующее фото"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-[linear-gradient(180deg,transparent,rgba(9,20,27,0.76))] p-5 text-white md:p-6">
            <div className="max-w-2xl">
              <p className="text-sm text-white/72">Фото объекта</p>
              <p className="mt-2 text-lg font-medium md:text-2xl">{activeImage.alt}</p>
            </div>
            <p className="rounded-full bg-white/14 px-3 py-2 text-xs tracking-[0.18em] text-white/82">
              {activeIndex + 1} / {normalizedImages.length}
            </p>
          </div>
        </div>
      </div>

      <div className="-mx-2 mt-4 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-3">
          {normalizedImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => goTo(index)}
              className={`group relative min-w-[96px] overflow-hidden rounded-[1.25rem] border transition md:min-w-[130px] ${
                index === activeIndex ? "border-pine shadow-[0_10px_30px_rgba(14,26,31,0.14)]" : "border-black/8"
              }`}
              aria-label={`Открыть фото ${index + 1}`}
            >
              <div className="relative h-24 w-24 md:h-28 md:w-[130px]">
                <Image src={image.url} alt={image.alt} fill className={`object-cover transition duration-300 ${index === activeIndex ? "scale-[1.03]" : "group-hover:scale-[1.04]"}`} />
              </div>
              <div className={`absolute inset-0 transition ${index === activeIndex ? "ring-1 ring-inset ring-pine/60" : "bg-black/0 group-hover:bg-black/5"}`} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
