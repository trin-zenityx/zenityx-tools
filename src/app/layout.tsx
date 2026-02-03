import type { Metadata } from "next";
import { Kanit, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"]
});

const kanit = Kanit({
  subsets: ["thai", "latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "ZenityX Tools",
  description: "ชุดเครื่องมือออนไลน์ของ ZenityX ที่ใช้งานง่าย คลีน และรวดเร็ว",
  icons: [{ rel: "icon", url: "/icon.svg" }]
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${notoThai.variable} ${kanit.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
