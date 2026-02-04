import heic2any from "heic2any";

export type LoadedImage = {
  image: HTMLImageElement;
  sourceBlob: Blob;
  url: string;
  revoke: () => void;
};

export function bytesToSize(bytes: number) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB"];
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, idx);
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[idx]}`;
}

export function isHeicFile(file: File) {
  const name = file.name.toLowerCase();
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

async function loadImageFromUrl(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

async function normalizeHeicBlob(blob: Blob) {
  const result = await heic2any({
    blob,
    toType: "image/jpeg",
    quality: 0.92
  });
  return Array.isArray(result) ? result[0] : result;
}

export async function fileToImage(file: File): Promise<LoadedImage> {
  const sourceBlob = isHeicFile(file) ? await normalizeHeicBlob(file) : file;
  const url = URL.createObjectURL(sourceBlob);
  const image = await loadImageFromUrl(url);
  return {
    image,
    sourceBlob,
    url,
    revoke: () => URL.revokeObjectURL(url)
  };
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  quality = 0.92
) {
  const image = await loadImageFromUrl(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas ไม่พร้อมใช้งาน");
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  const blob = await canvasToBlob(canvas, "image/jpeg", quality);
  if (!blob) throw new Error("ไม่สามารถสร้างไฟล์ใหม่ได้");
  const url = URL.createObjectURL(blob);
  return { blob, url };
}
