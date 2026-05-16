"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, GripVertical, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

type ExistingImage = {
  id: string;
  url: string;
  alt: string;
};

type ImageUploadPanelProps = {
  resortId: string;
  existingImages: ExistingImage[];
  reorderAction: (formData: FormData) => Promise<{ success: true } | { success: false; error: string }>;
};

const CLIENT_MAX_IMAGE_DIMENSION = 1800;
const CLIENT_WEBP_QUALITY = 0.8;

async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, CLIENT_MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", CLIENT_WEBP_QUALITY);
    });

    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

export function ImageUploadPanel({ resortId, existingImages, reorderAction }: ImageUploadPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [images, setImages] = useState(existingImages);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isReordering, setIsReordering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setImages(existingImages);
  }, [existingImages]);

  async function onUpload(formData: FormData) {
    setMessage("");
    setIsUploading(true);

    const files = formData.getAll("photos").filter((file): file is File => file instanceof File && file.size > 0);
    const uploadData = new FormData();
    uploadData.set("resortId", resortId);

    for (const file of files) {
      uploadData.append("photos", await compressImageFile(file));
    }

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: uploadData
    });

    setIsUploading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const nextMessage = payload?.errors?.[0] || payload?.message || "Не удалось загрузить фото.";
      setMessage(nextMessage);
      toast.error(nextMessage);
      return;
    }

    const nextMessage = "Фото загружены и сжаты.";
    setMessage(nextMessage);
    toast.success(nextMessage);
    startTransition(() => {
      router.refresh();
    });
  }

  async function persistOrder(nextImages: ExistingImage[]) {
    setIsReordering(true);
    const formData = new FormData();
    formData.set("resortId", resortId);
    nextImages.forEach((image) => formData.append("imageIds", image.id));

    const result = await reorderAction(formData);
    setIsReordering(false);

    if (!result.success) {
      setImages(existingImages);
      toast.error(result.error);
      return;
    }

    toast.success("Порядок фото сохранен");
    startTransition(() => {
      router.refresh();
    });
  }

  function moveImage(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= images.length || fromIndex === toIndex) return;
    const nextImages = [...images];
    const [moved] = nextImages.splice(fromIndex, 1);
    nextImages.splice(toIndex, 0, moved);
    setImages(nextImages);
    void persistOrder(nextImages);
  }

  function onDrop(targetIndex: number) {
    if (draggedIndex === null) return;
    moveImage(draggedIndex, targetIndex);
    setDraggedIndex(null);
  }

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#f7f1e6] text-pine">
          <ImageIcon size={18} />
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">Фото</p>
          <p className="mt-2 text-sm leading-6 text-black/65">
            Перетащите фото или используйте стрелки. Первое фото станет обложкой. Перед загрузкой снимки автоматически сжимаются.
          </p>
        </div>
      </div>

      <form action={onUpload} className="mt-5 space-y-4">
        <input type="hidden" name="resortId" value={resortId} />
        <input
          type="file"
          name="photos"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="block w-full rounded-2xl border border-dashed border-black/15 bg-mist px-4 py-5 text-sm"
        />
        <button disabled={isPending || isUploading} className="rounded-full bg-pine px-5 py-3 text-sm font-medium text-white disabled:opacity-60">
          {isUploading ? "Сжимаем и загружаем..." : "Загрузить фото"}
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-pine">{message}</p>}

      <div className="mt-6 grid gap-3">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => setDraggedIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => onDrop(index)}
            onDragEnd={() => setDraggedIndex(null)}
            className={`grid grid-cols-[74px_minmax(0,1fr)_auto] items-center gap-3 rounded-[1.25rem] border bg-white p-2 transition ${draggedIndex === index ? "border-pine/40 opacity-60" : "border-black/8"}`}
          >
            <div className="relative h-16 overflow-hidden rounded-[1rem] bg-black">
              <Image src={image.url} alt={image.alt} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium text-ink">
                <GripVertical size={16} className="text-black/35" />
                {index === 0 ? "Обложка" : `Фото ${index + 1}`}
              </div>
              <p className="mt-1 truncate text-xs text-black/45">{image.alt || "Фото зоны отдыха"}</p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={index === 0 || isReordering}
                onClick={() => moveImage(index, index - 1)}
                className="grid size-9 place-items-center rounded-full bg-[#f7f1e6] text-pine disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Поднять фото"
              >
                <ArrowUp size={15} />
              </button>
              <button
                type="button"
                disabled={index === images.length - 1 || isReordering}
                onClick={() => moveImage(index, index + 1)}
                className="grid size-9 place-items-center rounded-full bg-[#f7f1e6] text-pine disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Опустить фото"
              >
                <ArrowDown size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
