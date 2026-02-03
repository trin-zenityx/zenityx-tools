"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";

const ratioOptions = [
  { label: "อิสระ", value: "free" },
  { label: "1:1 (Square)", value: "1:1" },
  { label: "4:5 (Instagram)", value: "4:5" },
  { label: "16:9 (YouTube)", value: "16:9" },
  { label: "9:16 (Story)", value: "9:16" }
];

function parseRatio(value: string) {
  if (value === "free") return null;
  const [w, h] = value.split(":").map(Number);
  return w && h ? w / h : null;
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

export default function CropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [ratio, setRatio] = useState("free");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [previewUrl, resultUrl]);

  const handleFile = (nextFile: File | null) => {
    setFile(nextFile);
    setStatus(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    if (nextFile) {
      setPreviewUrl(URL.createObjectURL(nextFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleCrop = async () => {
    if (!file) return;
    setStatus("กำลังครอบภาพ...");
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    try {
      const image = await loadImageFromFile(file);
      const targetRatio = parseRatio(ratio);

      let sx = 0;
      let sy = 0;
      let sw = image.width;
      let sh = image.height;

      if (targetRatio) {
        const currentRatio = image.width / image.height;
        if (currentRatio > targetRatio) {
          sw = image.height * targetRatio;
          sx = (image.width - sw) / 2;
        } else {
          sh = image.width / targetRatio;
          sy = (image.height - sh) / 2;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas ไม่พร้อมใช้งาน");
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      );
      if (!blob) throw new Error("ไม่สามารถสร้างไฟล์ใหม่ได้");

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setStatus("ครอบภาพสำเร็จ");
    } catch {
      setStatus("เกิดข้อผิดพลาดในการครอบภาพ");
    }
  };

  return (
    <PageShell
      title="ครอบภาพ"
      description="เลือกสัดส่วนที่ต้องการแล้วครอบภาพได้ทันที รองรับโหมดอิสระ"
      breadcrumbs={[
        { label: "หน้าแรก", href: "/" },
        { label: "รูปภาพ", href: "/tools/image" },
        { label: "ครอบภาพ", href: "/tools/image/crop" }
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
          <span className="helper">รองรับไฟล์ PNG, JPG, WEBP</span>

          <label htmlFor="ratio">อัตราส่วน</label>
          <select
            id="ratio"
            className="input"
            value={ratio}
            onChange={(event) => setRatio(event.target.value)}
          >
            {ratioOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button className="btn primary" type="button" onClick={handleCrop}>
            ครอบภาพ
          </button>
          {status ? <span className="helper">{status}</span> : null}
        </div>

        <div className="form-panel">
          <h3>พื้นที่ครอบ</h3>
          <div className="preview">
            {resultUrl ? (
              <img src={resultUrl} alt="ภาพที่ครอบแล้ว" />
            ) : previewUrl ? (
              <img src={previewUrl} alt="ตัวอย่างไฟล์" />
            ) : (
              "Crop Preview"
            )}
          </div>
          {resultUrl ? (
            <a className="btn secondary" href={resultUrl} download="zenityx-crop.jpg">
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
