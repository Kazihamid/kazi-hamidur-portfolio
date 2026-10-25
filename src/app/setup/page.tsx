"use client";
import { usePortfolio } from "@/context/PortfolioContext";
import { ProfessionalIcon } from "@/components/ProfessionalIcon";
import Link from "next/link";

export default function SetupDashboard(){
  const {data,cloud}=usePortfolio();
  const checks=[Boolean(data.profile.name),Boolean(data.profile.email),Boolean(data.profile.cv),data.projects.every(p=>Boolean(p.description)),data.experience.length>0,Boolean(data.seo.title),Boolean(data.seo.description)];
  const score=Math.round(checks.filter(Boolean).length/checks.length*100);
  return <>
    <div className="setup-header"><div><span className="eyebrow">PORTFOLIO CONTROL CENTER</span><h1>Dashboard</h1><p>Manage content, review portfolio health and prepare publishing exports.</p></div><Link className="button compact" href="/"><ProfessionalIcon name="navigation" className="button-icon"/>Preview Site ↗</Link></div>
    <section className="setup-cards">
      <article className="admin-card health"><div className="health-ring" style={{'--score':`${score}%`} as React.CSSProperties}><strong>{score}%</strong></div><div><div className="admin-title-row"><ProfessionalIcon name="health" className="admin-icon"/><h2>Portfolio Health</h2></div><p>{score>=90?'Excellent':'Needs attention'}</p></div></article>
      <article className="admin-card stat"><ProfessionalIcon name="project" className="admin-icon"/><strong>{data.projects.length}</strong><span>Projects</span></article>
      <article className="admin-card stat"><ProfessionalIcon name="experience" className="admin-icon"/><strong>{data.experience.length}</strong><span>Experience</span></article>
      <article className="admin-card stat"><ProfessionalIcon name="skills" className="admin-icon"/><strong>{data.skills.reduce((n,g)=>n+g.items.length,0)}</strong><span>Skills</span></article>
    </section>
    <section className="admin-grid">
      <article className="admin-card"><div className="admin-title-row"><ProfessionalIcon name="check" className="admin-icon"/><h2>Health Checks</h2></div><ul className="check-list"><li><ProfessionalIcon name="check" className="check-icon"/>Profile configured</li><li><ProfessionalIcon name="check" className="check-icon"/>Contact information available</li><li><ProfessionalIcon name="check" className="check-icon"/>CV asset configured</li><li><ProfessionalIcon name="check" className="check-icon"/>Published project descriptions</li><li><ProfessionalIcon name="check" className="check-icon"/>Experience timeline available</li><li><ProfessionalIcon name="check" className="check-icon"/>SEO metadata configured</li></ul></article>
      <article className="admin-card"><div className="admin-title-row"><ProfessionalIcon name="settings" className="admin-icon"/><h2>Publishing</h2></div>{cloud ? <><p>Edit any section, then click Save &amp; Publish. Your live portfolio will use the saved content without a deployment.</p><p className="notice">Save Draft keeps a private browser backup. View Portfolio shows the last published version.</p></> : <><p>Save Draft stores edits in this browser. Export JSON and commit it to publish on GitHub Pages.</p><p className="notice">View Portfolio shows published content.</p></>}</article>
    </section>
  </>;
}
