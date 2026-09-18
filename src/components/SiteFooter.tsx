"use client";
import Link from "next/link";
import { usePortfolio } from "@/context/PortfolioContext";
export function SiteFooter() {
  const { data } = usePortfolio();
  return <footer className="footer"><div className="shell footer-grid">
    <div><div className="brand">Portfolio <span>|</span> {data.profile.name}</div><small>{data.profile.title}</small></div>
    <div className="footer-links">{data.navigation.filter(n=>n.visible).map(n=><Link key={n.href} href={n.href}>{n.label}</Link>)}</div>
    <div className="footer-social"><a href={data.profile.linkedin} target="_blank">LinkedIn ↗</a><a href={data.profile.github} target="_blank">GitHub ↗</a><a href={`mailto:${data.profile.email}`}>Email</a></div>
  </div></footer>;
}
