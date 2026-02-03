import Link from "next/link";

const imageTools = [
  {
    title: "แปลงไฟล์ภาพ",
    description: "แปลงไฟล์ภาพเป็น PNG, JPG, WEBP ได้อย่างรวดเร็ว",
    href: "/tools/image/convert",
    icon: "FX"
  },
  {
    title: "ครอบภาพ",
    description: "ตัดภาพตามสัดส่วนที่ต้องการ พร้อมไกด์เส้นช่วย",
    href: "/tools/image/crop",
    icon: "CR"
  },
  {
    title: "ย่อ/ขยายภาพ",
    description: "ปรับขนาดภาพแบบคงสัดส่วนหรือกำหนดเอง",
    href: "/tools/image/resize",
    icon: "RS"
  },
  {
    title: "บีบอัดภาพ",
    description: "ลดขนาดไฟล์โดยยังคงคุณภาพให้เหมาะกับเว็บ",
    href: "/tools/image/optimize",
    icon: "OP"
  }
];

export default function Home() {
  return (
    <main>
      <div className="container">
        <nav className="nav">
          <div className="brand">
            <div className="brand-mark">ZX</div>
            <span>ZenityX Tools</span>
          </div>
          <div className="nav-links">
            <span>ภาพ</span>
            <span>เอกสาร</span>
            <span>เสียง</span>
            <span>วิดีโอ</span>
          </div>
          <span className="pill">Beta</span>
        </nav>

        <section className="hero">
          <div>
            <p className="pill" style={{ display: "inline-flex", gap: 8 }}>
              รวมเครื่องมือคุณภาพสูงไว้ที่เดียว
            </p>
            <h1>ZenityX Tools จัดการไฟล์ให้เร็วและสวยขึ้นในไม่กี่คลิก</h1>
            <p>
              เรารวมเครื่องมือใช้งานจริงสำหรับทีมครีเอทีฟ นักพัฒนา และทุกคนที่ต้องการความเร็ว
              เริ่มต้นจากหมวดรูปภาพ และจะเพิ่มหมวดอื่น ๆ ต่อไปอย่างต่อเนื่อง
            </p>
            <div className="cta-row">
              <Link className="btn primary" href="/tools/image">
                ไปที่เครื่องมือภาพ
              </Link>
              <Link className="btn secondary" href="#roadmap">
                ดูแผนการเพิ่ม Tools
              </Link>
            </div>
          </div>
          <div className="hero-card">
            <h3>ไฮไลต์วันนี้</h3>
            <p>
              แปลง, ครอบ, และย่อขยายภาพได้ในหน้าที่สะอาดตา รองรับไฟล์ยอดนิยม และใช้งานง่ายบนมือถือ
            </p>
            <div className="grid" style={{ marginTop: 20 }}>
              {imageTools.slice(0, 3).map((tool) => (
                <Link key={tool.title} className="tool-card" href={tool.href}>
                  <div className="tool-icon">{tool.icon}</div>
                  <div>
                    <h4>{tool.title}</h4>
                    <p>{tool.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="container">
        <div className="section-title">
          <h2>หมวดรูปภาพ</h2>
          <span>เวิร์กโฟลว์แบบมืออาชีพ ใช้งานง่าย</span>
        </div>
        <div className="grid">
          {imageTools.map((tool) => (
            <Link key={tool.title} className="tool-card" href={tool.href}>
              <div className="tool-icon">{tool.icon}</div>
              <div>
                <h4>{tool.title}</h4>
                <p>{tool.description}</p>
              </div>
              <span className="pill" style={{ width: "fit-content" }}>
                เปิดใช้งาน
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="roadmap" className="container">
        <div className="section-title">
          <h2>Tools ที่กำลังมา</h2>
          <span>เพิ่มหมวดใหม่ในเร็ว ๆ นี้</span>
        </div>
        <div className="grid">
          {[
            { title: "เอกสาร", detail: "แปลง PDF, รวมไฟล์, OCR" },
            { title: "เสียง", detail: "ตัดเสียง, ลด Noise, แปลงฟอร์แมต" },
            { title: "วิดีโอ", detail: "ตัดต่อเบื้องต้น, บีบอัด, ใส่ซับ" }
          ].map((item) => (
            <div key={item.title} className="tool-card">
              <div className="tool-icon">{item.title.slice(0, 2)}</div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.detail}</p>
              </div>
              <span className="helper">เร็ว ๆ นี้</span>
            </div>
          ))}
        </div>

        <footer className="footer">
          <span>ZenityX Tools • อัปเดตล่าสุด 3 กุมภาพันธ์ 2026</span>
          <span>Built with Next.js + Bun</span>
        </footer>
      </section>
    </main>
  );
}
