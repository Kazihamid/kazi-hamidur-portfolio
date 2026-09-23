"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { CvDownloadMenu } from "@/components/CvDownloadMenu";

export function SiteHeader() {
  const { data } = usePortfolio();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const pathWithoutBase = basePath && pathname.startsWith(basePath)
    ? pathname.slice(basePath.length) || "/"
    : pathname;
  const normalizePath = (value: string) => {
    if (!value) return "/";
    const normalized = value.replace(/\/+$/, "");
    return normalized || "/";
  };
  const currentPath = normalizePath(pathWithoutBase);

  return <header className="site-header"><div className="shell nav-wrap">
    <Link href="/" className="brand">Portfolio <span>|</span> {data.profile.name}</Link>
    <button className="menu-button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(v => !v)}>☰</button>
    <nav className={open ? "nav open" : "nav"} aria-label="Primary navigation">
      {data.navigation.filter(item=>item.visible).map(item=>{
        const active=currentPath===normalizePath(item.href);
        return <Link key={item.href} href={item.href} className={active?"active":""} aria-current={active?"page":undefined} onClick={()=>setOpen(false)}>{item.label}</Link>;
      })}
    </nav>
    <CvDownloadMenu compact className="desktop-only" />
  </div></header>;
}
