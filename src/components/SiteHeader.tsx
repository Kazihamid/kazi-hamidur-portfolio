"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePortfolio } from "@/context/PortfolioContext";
import { useState } from "react";
import { assetPath } from "@/lib/paths";

export function SiteHeader() {
  const { data } = usePortfolio();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="shell nav-wrap">
        <Link href="/" className="brand">KH<span>.</span></Link>
        <button className="menu-button" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>☰</button>
        <nav className={open ? "nav open" : "nav"}>
          {data.navigation.filter((n) => n.visible).map((n) => (
            <Link key={n.href} href={n.href} className={pathname === n.href ? "active" : ""} onClick={() => setOpen(false)}>{n.label}</Link>
          ))}
        </nav>
        <a className="button compact desktop-only" href={assetPath(data.profile.cv)} download>Download CV</a>
      </div>
    </header>
  );
}
