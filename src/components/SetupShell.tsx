"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["Dashboard","/setup"],["Profile","/setup/profile"],["Home","/setup/home"],["Experience","/setup/experience"],
  ["Projects","/setup/projects"],["Leadership","/setup/leadership"],["Certifications","/setup/certifications"],["Navigation","/setup/navigation"],["Import / Export","/setup/export"]
];
export function SetupShell({ children }: {children: React.ReactNode}) {
  const path = usePathname();
  return <div className="setup-layout"><aside className="setup-sidebar"><div className="setup-logo">KH. <span>Portfolio</span></div>{items.map(([label,href])=><Link key={href} href={href} className={path===href?"selected":""}>{label}</Link>)}<Link href="/" className="preview-link">↗ View Portfolio</Link></aside><main className="setup-main">{children}</main></div>;
}
