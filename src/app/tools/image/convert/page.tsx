"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PageShell from "@/components/PageShell";
import JSZip from "jszip";
import {
  bytesToSize,
  canvasToBlob,
  fileToImage,
  isHeicFile
} from "@/lib/image";

type ConvertFormat = "PNG" | "JPG" | "WEBP";

type ConvertItem = {
  id: string;
  file: File;
  status: "idle" | "working" | "done" | "error";
  message?: string;
  outputUrl?: string;
  outputBlob?: Blob;
  outputSize?: number;
  previewUrl?: string;
};

const formatToMime: Record<ConvertFormat, string> = {
  PNG: "image/png",
  JPG: "image/jpeg",
  WEBP: "image/webp"
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getOutputName(file: File, format: ConvertFormat) {
  const base = file.name.replace(/\.[^.]+$/, "");
  return `${base}.${format.toLowerCase()}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ConvertPage() {
  const [items, setItems] = useState<ConvertItem[]>([]);
  const [format, setFormat] = useState<ConvertFormat>("PNG");
  const [quality, setQuality] = useState(88);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const itemsRef = useRef<ConvertItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
      });
    };
  }, []);

  const originalSize = useMemo(() => {
    const file = items.find((item) => item.id === selectedId)?.file;
    return file ? bytesToSize(file.size) : "-";
  }, [items, selectedId]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  );

  const handleFiles = (files: FileList | null) => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
    });

    if (!files || files.length === 0) {
      setItems([]);
      setSelectedId(null);
      setStatus(null);
      return;
    }

    const nextItems: ConvertItem[] = Array.from(files).map((file) => {
      const previewUrl = !isHeicFile(file) ? URL.createObjectURL(file) : undefined;
      return {
        id: makeId(),
        file,
        status: "idle",
        previewUrl
      };
    });

    setItems(nextItems);
    setSelectedId(nextItems[0].id);
    setStatus(null);
  };

  const updateItem = (id: string, patch: Partial<ConvertItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleConvert = async () => {
    if (items.length === 0) return;
    setIsWorking(true);
    setStatus("กำลังแปลงไฟล์...");
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    for (const item of items) {
      updateItem(item.id, { status: "working", message: "กำลังแปลง" });
      try {
        const { image, revoke } = await fileToImage(item.file);
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas ไม่พร้อมใช้งาน");
        ctx.drawImage(image, 0, 0);

        const mime = formatToMime[format];
        const q = format === "PNG" ? 1 : quality / 100;
        const blob = await canvasToBlob(canvas, mime, q);
        if (!blob) throw new Error("ไม่สามารถสร้างไฟล์ใหม่ได้");

        if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
        const url = URL.createObjectURL(blob);
        updateItem(item.id, {
          status: "done",
          message: "เสร็จแล้ว",
          outputUrl: url,
          outputBlob: blob,
          outputSize: blob.size
        });
        revoke();
      } catch {
        updateItem(item.id, { status: "error", message: "แปลงไม่สำเร็จ" });
      }
    }

    setStatus("แปลงไฟล์เสร็จแล้ว");
    setIsWorking(false);
  };

  const handleDownloadAll = async () => {
    const completed = items.filter((item) => item.outputBlob);
    if (completed.length === 0) return;
    const zip = new JSZip();
    completed.forEach((item) => {
      if (item.outputBlob) {
        zip.file(getOutputName(item.file, format), item.outputBlob);
      }
    });
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, `zenityx-convert-${Date.now()}.zip`);
  };

  const canDownloadAll = items.length > 1 && items.every((item) => item.status === "done");

  return (
    <PageShell
      title="แปลงไฟล์ภาพ"
      description="แปลงไฟล์ภาพเป็น PNG, JPG หรือ WEBP โดยตั้งค่าคุณภาพได้ตามต้องการ (รองรับ HEIC และแบบหลายไฟล์)"
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
            accept="image/*,.heic,.heif"
            multiple
            onChange={(event) => handleFiles(event.target.files)}
          />
          <span className="helper">รองรับไฟล์ PNG, JPG, WEBP, HEIC (เลือกหลายไฟล์ได้)</span>

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

          <button className="btn primary" type="button" onClick={handleConvert} disabled={isWorking}>
            {isWorking ? "กำลังแปลง..." : "แปลงไฟล์"}
          </button>
          {status ? <span className="helper">{status}</span> : null}
        </div>

        <div className="form-panel">
          <h3>ไฟล์ที่เลือก</h3>
          <div className="list">
            {items.length === 0 ? (
              <span className="helper">ยังไม่มีไฟล์</span>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`list-item ${selectedId === item.id ? "active" : ""}`}
                  onClick={() => setSelectedId(item.id)}
                >
                  <div>
                    <strong>{item.file.name}</strong>
                    <div className="helper">{bytesToSize(item.file.size)}</div>
                  </div>
                  <span className={`chip ${item.status}`}>{item.message ?? "รอ"}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 24 }}>
        <div className="form-panel">
          <h3>ตัวอย่างผลลัพธ์</h3>
          <div className="stat-row">
            <span className="tag">ไฟล์ต้นฉบับ: {originalSize}</span>
            <span className="tag">
              ผลลัพธ์: {selectedItem?.outputSize ? bytesToSize(selectedItem.outputSize) : "-"}
            </span>
          </div>
          <div className="preview">
            {selectedItem?.outputUrl ? (
              <img src={selectedItem.outputUrl} alt="ไฟล์ที่แปลงแล้ว" />
            ) : selectedItem?.previewUrl ? (
              <img src={selectedItem.previewUrl} alt="ตัวอย่างไฟล์" />
            ) : (
              "Preview Area"
            )}
          </div>
          {selectedItem?.outputUrl ? (
            <a
              className="btn secondary"
              href={selectedItem.outputUrl}
              download={getOutputName(selectedItem.file, format)}
            >
              ดาวน์โหลดไฟล์
            </a>
          ) : (
            <button className="btn secondary" type="button" disabled>
              ดาวน์โหลดไฟล์
            </button>
          )}
          <button className="btn secondary" type="button" onClick={handleDownloadAll} disabled={!canDownloadAll}>
            ดาวน์โหลดทั้งหมด (zip)
          </button>
        </div>
      </div>
    </PageShell>
  );
}
