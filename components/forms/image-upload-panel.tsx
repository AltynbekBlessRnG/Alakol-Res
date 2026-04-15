"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ExistingImage = {
  id: string;
  url: string;
  alt: string;
};

export function ImageUploadPanel({
  resortId,
  existingImages
}: {
  resortId: string;
  existingImages: ExistingImage[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function onUpload(formData: FormData) {
    setMessage("");
    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      setMessage("Не удалось загрузить фото.");
      return;
    }

    setMessage("Фото загружены.");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
      <p className="text-xs uppercase tracking-[0.2em] text-black/45">Загрузка фото</p>
      <p className="mt-3 text-sm leading-6 text-black/65">
        Можно загрузить несколько файлов сразу. Они сохраняются локально в проект и остаются после перезапуска приложения.
      </p>
      <form action={onUpload} className="mt-5 space-y-4">
        <input type="hidden" name="resortId" value={resortId} />
        <input
          type="file"
          name="photos"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="block w-full rounded-2xl border border-dashed border-black/15 bg-mist px-4 py-5 text-sm"
        />
        <button disabled={isPending} className="rounded-full bg-pine px-5 py-3 text-sm font-medium text-white disabled:opacity-60">
          {isPending ? "Загружаем..." : "Загрузить фото"}
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-pine">{message}</p>}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {existingImages.map((image) => (
          <div key={image.id} className="overflow-hidden rounded-[1.25rem]">
            <div className="relative h-28">
              <Image src={image.url} alt={image.alt} fill className="object-cover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
