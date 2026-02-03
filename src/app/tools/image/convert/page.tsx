"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";

type ConvertFormat = "PNG" | "JPG" | "WEBP";

const formatToMime: Record<ConvertFormat, string> = {
  PNG: "image/png",
  JPG: "image/jpeg",
  WEBP: "image/webp"
};

function bytesToSize(bytes: number) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB"];
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, idx);
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[idx]}`;
}

async function loadImageFromFile(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function ConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [format, setFormat] = useState<ConvertFormat>("PNG");
  const [quality, setQuality] = useState(88);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [previewUrl, resultUrl]);

  const originalSize = useMemo(() => (file ? bytesToSize(file.size) : "-") , [file]);

  const handleFile = (nextFile: File | null) => {
    setFile(nextFile);
    setStatus(null);
    setResultUrl(null);
    setResultSize(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (nextFile) {
      setPreviewUrl(URL.createObjectURL(nextFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setStatus("กำลังแปลงไฟล์...");
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    try {
      const image = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas ไม่พร้อมใช้งาน");
      ctx.drawImage(image, 0, 0);

      const mime = formatToMime[format];
      const q = format === "PNG" ? 1 : quality / 100;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, mime, q)
      );
      if (!blob) throw new Error("ไม่สามารถสร้างไฟล์ใหม่ได้");

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
      setStatus("แปลงไฟล์สำเร็จ");
    } catch {
      setStatus("เกิดข้อผิดพลาดในการแปลงไฟล์");
    }
  };

  return (
    <PageShell
      title="แปลงไฟล์ภาพ"
      description="แปลงไฟล์ภาพเป็น PNG, JPG หรือ WEBP โดยตั้งค่าคุณภาพได้ตามต้องการ"
      breadcrumbs={[
        { label: "หน้าแรก", href: "/" },
        { label: "รูปภาพ", href: "/tools/image" },
        { label: "แปลงไฟล์ภาพ", href: "/tools/image/convert" }
      ]}
    >
      <div className="grid">
        <div className="form-panel">
          <label htmlFor="file">อัปโหลดไฟล์</label>
          <input
            id="file"
            className="input"
            type="file"
            accept="image/*"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />
          <span className="helper">รองรับไฟล์ PNG, JPG, WEBP, HEIC</span>

          <label htmlFor="format">ฟอร์แมตปลายทาง</label>
          <select
            id="format"
            className="input"
            value={format}
            onChange={(event) => setFormat(event.target.value as ConvertFormat)}
          >
            <option>PNG</option>
            <option>JPG</option>
            <option>WEBP</option>
          </select>

          <label htmlFor="quality">คุณภาพไฟล์ ({quality}%)</label>
          <input
            id="quality"
            className="input"
            type="range"
            min={40}
            max={100}
            value={quality}
            onChange={(event) => setQuality(Number(event.target.value))}
          />
          <span className="helper">แนะนำ 80-92 สำหรับสมดุลคุณภาพและขนาดไฟล์</span>

          <button className="btn primary" type="button" onClick={handleConvert}>
            แปลงไฟล์
          </button>
          {status ? <span className="helper">{status}</span> : null}
        </div>

        <div className="form-panel">
          <h3>ตัวอย่างผลลัพธ์</h3>
          <div className="stat-row">
            <span className="tag">ไฟล์ต้นฉบับ: {originalSize}</span>
            <span className="tag">ผลลัพธ์: {resultSize ? bytesToSize(resultSize) : "-"}</span>
          </div>
          <div className="preview">
            {resultUrl ? (
              <img src={resultUrl} alt="ไฟล์ที่แปลงแล้ว" />
            ) : previewUrl ? (
              <img src={previewUrl} alt="ตัวอย่างไฟล์" />
            ) : (
              "Preview Area"
            )}
          </div>
          {resultUrl ? (
            <a className="btn secondary" href={resultUrl} download={`zenityx-convert.${format.toLowerCase()}`}>
              ดาวน์โหลดไฟล์
            </a>
          ) : (
            <button className="btn secondary" type="button" disabled>
              ดาวน์โหลดไฟล์
            </button>
          )}
        </div>
      </div>
    </PageShell>
  );
}
