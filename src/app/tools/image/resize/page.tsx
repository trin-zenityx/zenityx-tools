"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";

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

export default function ResizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [lock, setLock] = useState(true);
  const [width, setWidth] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [origin, setOrigin] = useState<{ w: number; h: number } | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [previewUrl, resultUrl]);

  const handleFile = async (nextFile: File | null) => {
    setFile(nextFile);
    setStatus(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    if (!nextFile) {
      setPreviewUrl(null);
      setOrigin(null);
      setWidth("");
      setHeight("");
      return;
    }
    setPreviewUrl(URL.createObjectURL(nextFile));
    const img = await loadImageFromFile(nextFile);
    setOrigin({ w: img.width, h: img.height });
    setWidth(img.width);
    setHeight(img.height);
  };

  const handleWidthChange = (value: number) => {
    setWidth(value);
    if (lock && origin) {
      const nextHeight = Math.round((value / origin.w) * origin.h);
      setHeight(nextHeight);
    }
  };

  const handleHeightChange = (value: number) => {
    setHeight(value);
    if (lock && origin) {
      const nextWidth = Math.round((value / origin.h) * origin.w);
      setWidth(nextWidth);
    }
  };

  const handleResize = async () => {
    if (!file || !width || !height) return;
    setStatus("กำลังปรับขนาด...");
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    try {
      const image = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas ไม่พร้อมใช้งาน");
      ctx.drawImage(image, 0, 0, width, height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      );
      if (!blob) throw new Error("ไม่สามารถสร้างไฟล์ใหม่ได้");
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setStatus("ปรับขนาดสำเร็จ");
    } catch {
      setStatus("เกิดข้อผิดพลาดในการปรับขนาด");
    }
  };

  return (
    <PageShell
      title="ย่อ/ขยายภาพ"
      description="กำหนดขนาดใหม่ของภาพ พร้อมล็อกสัดส่วนอัตโนมัติ"
      breadcrumbs={[
        { label: "หน้าแรก", href: "/" },
        { label: "รูปภาพ", href: "/tools/image" },
        { label: "ย่อ/ขยายภาพ", href: "/tools/image/resize" }
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

          <label htmlFor="width">ความกว้าง (px)</label>
          <input
            id="width"
            className="input"
            type="number"
            value={width}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "") {
                setWidth("");
                return;
              }
              handleWidthChange(Number(value));
            }}
          />

          <label htmlFor="height">ความสูง (px)</label>
          <input
            id="height"
            className="input"
            type="number"
            value={height}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "") {
                setHeight("");
                return;
              }
              handleHeightChange(Number(value));
            }}
          />

          <label htmlFor="lock">ล็อกสัดส่วน</label>
          <select
            id="lock"
            className="input"
            value={lock ? "lock" : "unlock"}
            onChange={(event) => setLock(event.target.value === "lock")}
          >
            <option value="lock">ล็อกอัตโนมัติ</option>
            <option value="unlock">ปลดล็อก</option>
          </select>

          <button className="btn primary" type="button" onClick={handleResize}>
            ปรับขนาด
          </button>
          {status ? <span className="helper">{status}</span> : null}
        </div>

        <div className="form-panel">
          <h3>ขนาดที่ได้</h3>
          <div className="stat-row">
            <span className="tag">ต้นฉบับ: {origin ? `${origin.w}x${origin.h}px` : "-"}</span>
            <span className="tag">ใหม่: {width && height ? `${width}x${height}px` : "-"}</span>
          </div>
          <div className="preview">
            {resultUrl ? (
              <img src={resultUrl} alt="ภาพที่ปรับขนาดแล้ว" />
            ) : previewUrl ? (
              <img src={previewUrl} alt="ตัวอย่างไฟล์" />
            ) : (
              "Resize Preview"
            )}
          </div>
          {resultUrl ? (
            <a className="btn secondary" href={resultUrl} download="zenityx-resize.jpg">
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
