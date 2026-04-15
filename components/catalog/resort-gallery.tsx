import Image from "next/image";

type ResortGalleryImage = {
  id: string;
  url: string;
  alt: string;
};

export function ResortGallery({ images }: { images: ResortGalleryImage[] }) {
  if (!images.length) return null;

  return (
    <>
      <div className="md:hidden">
        <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex snap-x snap-mandatory gap-4">
            {images.map((image, index) => (
              <div key={image.id} className="min-w-[84%] snap-center">
                <div className="relative aspect-[0.86] overflow-hidden rounded-[2rem] shadow-[0_18px_50px_rgba(19,32,40,0.12)]">
                  <Image src={image.url} alt={image.alt} fill className="object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[linear-gradient(180deg,transparent,rgba(9,20,27,0.72))] p-4 text-white">
                    <p className="text-sm font-medium">{image.alt}</p>
                    <p className="rounded-full bg-white/12 px-3 py-1 text-xs">{index + 1} / {images.length}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-[1.15fr_0.85fr]">
        {images.slice(0, 2).map((image, index) => (
          <div key={image.id} className={`relative overflow-hidden rounded-[2rem] shadow-[0_18px_70px_rgba(14,26,31,0.08)] ${index === 0 ? "h-[420px]" : "h-[300px]"}`}>
            <Image src={image.url} alt={image.alt} fill className="object-cover" />
          </div>
        ))}
      </div>
    </>
  );
}
