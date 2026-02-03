import Link from "next/link";
import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  description: string;
  breadcrumbs?: { label: string; href: string }[];
  children: ReactNode;
};

export default function PageShell({ title, description, breadcrumbs, children }: PageShellProps) {
  return (
    <main>
      <div className="container">
        <nav className="nav">
          <div className="brand">
            <div className="brand-mark">ZX</div>
            <Link href="/">ZenityX Tools</Link>
          </div>
          <div className="nav-links">
            <Link href="/tools/image">ภาพ</Link>
            <span>เอกสาร</span>
            <span>เสียง</span>
            <span>วิดีโอ</span>
          </div>
          <span className="pill">Beta</span>
        </nav>

        {breadcrumbs && breadcrumbs.length > 0 ? (
          <div className="breadcrumb">
            {breadcrumbs.map((item, index) => (
              <span key={item.href}>
                {index > 0 ? " / " : ""}
                <Link href={item.href}>{item.label}</Link>
              </span>
            ))}
          </div>
        ) : null}

        <section className="page-hero">
          <h1>{title}</h1>
          <p>{description}</p>
        </section>

        <section style={{ marginTop: 28 }}>{children}</section>
      </div>
    </main>
  );
}
