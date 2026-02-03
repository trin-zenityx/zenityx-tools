import Link from "next/link";
import PageShell from "@/components/PageShell";

const imageTools = [
  {
    title: "แปลงไฟล์ภาพ",
    description: "รองรับ PNG, JPG, WEBP พร้อมตั้งค่าคุณภาพ",
    href: "/tools/image/convert",
    icon: "FX"
  },
  {
    title: "ครอบภาพ",
    description: "ครอบแบบสัดส่วนอัตโนมัติหรือกำหนดเอง",
    href: "/tools/image/crop",
    icon: "CR"
  },
  {
    title: "ย่อ/ขยายภาพ",
    description: "ปรับขนาดภาพสำหรับโซเชียลและเว็บไซต์",
    href: "/tools/image/resize",
    icon: "RS"
  },
  {
    title: "บีบอัดภาพ",
    description: "ลดขนาดไฟล์ด้วยการเลือกคุณภาพที่เหมาะสม",
    href: "/tools/image/optimize",
    icon: "OP"
  }
];

export default function ImageToolsPage() {
  return (
    <PageShell
      title="หมวดรูปภาพ"
      description="เครื่องมือครบสำหรับจัดการไฟล์ภาพ เลือกฟังก์ชันที่ต้องการแล้วเริ่มใช้งานได้ทันที"
      breadcrumbs={[
        { label: "หน้าแรก", href: "/" },
        { label: "รูปภาพ", href: "/tools/image" }
      ]}
    >
      <div className="grid">
        {imageTools.map((tool) => (
          <Link key={tool.title} className="tool-card" href={tool.href}>
            <div className="tool-icon">{tool.icon}</div>
            <div>
              <h4>{tool.title}</h4>
              <p>{tool.description}</p>
            </div>
            <span className="pill" style={{ width: "fit-content" }}>
              เริ่มใช้งาน
            </span>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
