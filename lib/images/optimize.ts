import sharp from "sharp";

export type OptimizedImage = {
  buffer: Buffer;
  contentType: "image/webp";
  extension: ".webp";
  originalSize: number;
  optimizedSize: number;
  width?: number;
  height?: number;
};

const MAX_IMAGE_DIMENSION = 1600;
const WEBP_QUALITY = 78;

export async function optimizeImageBuffer(input: Buffer): Promise<OptimizedImage> {
  const image = sharp(input, { failOn: "warning" }).rotate();
  const metadata = await image.metadata();

  const buffer = await image
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({
      quality: WEBP_QUALITY,
      effort: 5
    })
    .toBuffer();

  return {
    buffer,
    contentType: "image/webp",
    extension: ".webp",
    originalSize: input.length,
    optimizedSize: buffer.length,
    width: metadata.width,
    height: metadata.height
  };
}
