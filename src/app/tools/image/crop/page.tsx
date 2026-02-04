"use client";

import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import PageShell from "@/components/PageShell";
import { fileToImage, getCroppedImage, isHeicFile } from "@/lib/image";

const ratioOptions = [
  { label: "อิสระ", value: "free" },
  { label: "1:1 (Square)", value: "1:1" },
  { label: "4:5 (Instagram)", value: "4:5" },
  { label: "16:9 (YouTube)", value: "16:9" },
  { label: "9:16 (Story)", value: "9:16" }
];

function parseRatio(value: string) {
  if (value === "free") return undefined;
  const [w, h] = value.split(":").map(Number);
  return w && h ? w / h : undefined;
}

export default function CropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [ratio, setRatio] = useState("free");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [imageUrl, resultUrl]);

  const handleFile = async (nextFile: File | null) => {
    setFile(nextFile);
    setStatus(null);
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);

    if (!nextFile) {
      setImageUrl(null);
      return;
    }

    if (isHeicFile(nextFile)) {
      const { url } = await fileToImage(nextFile);
      setImageUrl(url);
    } else {
      setImageUrl(URL.createObjectURL(nextFile));
    }
  };

  const handleCrop = async () => {
    if (!file || !imageUrl || !croppedAreaPixels) return;
    setStatus("กำลังครอบภาพ...");
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    try {
      const { url } = await getCroppedImage(imageUrl, croppedAreaPixels);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(url);
      setStatus("ครอบภาพสำเร็จ");
    } catch {
      setStatus("เกิดข้อผิดพลาดในการครอบภาพ");
    }
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <PageShell
      title="ครอบภาพ"
      description="ลากเพื่อเลือกกรอบครอป ซูม/แพนได้ พร้อมสัดส่วนมาตรฐาน"
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
            accept="image/*,.heic,.heif"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />
          <span className="helper">รองรับไฟล์ PNG, JPG, WEBP, HEIC</span>

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

          <div className="slider">
            <label htmlFor="zoom">ซูม ({zoom.toFixed(2)}x)</label>
            <input
              id="zoom"
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
          </div>

          <div className="cta-row">
            <button className="btn secondary" type="button" onClick={resetCrop}>
              รีเซ็ต
            </button>
            <button className="btn primary" type="button" onClick={handleCrop}>
              ครอบภาพ
            </button>
          </div>
          {status ? <span className="helper">{status}</span> : null}
        </div>

        <div className="form-panel">
          <h3>พื้นที่ครอบ</h3>
          {imageUrl ? (
            <div className="cropper-shell">
              <Cropper
                image={imageUrl}
                crop={crop}
                zoom={zoom}
                aspect={parseRatio(ratio)}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
              />
            </div>
          ) : (
            <div className="preview">Crop Preview</div>
          )}
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
