"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProfessionalIcon, type IconName } from "@/components/ProfessionalIcon";

const items: Array<[string,string,IconName]> = [
  ["Dashboard","/setup","home"],
  ["Profile","/setup/profile","profile"],
  ["Home","/setup/home","home"],
  ["Experience","/setup/experience","experience"],
  ["Projects","/setup/projects","project"],
  ["Leadership","/setup/leadership","leadership"],
  ["Certifications","/setup/certifications","certificate"],
  ["Navigation","/setup/navigation","navigation"],
  ["Import / Export","/setup/export","import"],
];

export function SetupShell({ children }: {children: React.ReactNode}) {
  const path = usePathname();
  return <div className="setup-layout"><aside className="setup-sidebar">
    <div className="setup-logo">Portfolio <span>| Kazi Hamidur Rahman</span></div>
    {items.map(([label,href,icon])=><Link key={href} href={href} className={path===href?"selected":""}><ProfessionalIcon name={icon} className="setup-nav-icon"/><span>{label}</span></Link>)}
    <Link href="/" className="preview-link"><ProfessionalIcon name="navigation" className="setup-nav-icon"/><span>View Portfolio</span></Link>
  </aside><main className="setup-main">{children}</main></div>;
}
