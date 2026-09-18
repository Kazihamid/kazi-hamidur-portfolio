"use client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHero } from "@/components/PageHero";
import { ProfessionalIcon, type IconName } from "@/components/ProfessionalIcon";
import { usePortfolio } from "@/context/PortfolioContext";
import { assetPath } from "@/lib/paths";

function skillIcon(group: string): IconName {
  const key = group.toLowerCase();
  if (key.includes("leadership")) return "leadership";
  if (key.includes("automation")) return "automation";
  if (key.includes("api")) return "api";
  if (key.includes("performance")) return "performance";
  if (key.includes("database")) return "database";
  return "skills";
}

export default function About() {
  const { data } = usePortfolio();
  return <><SiteHeader /><main>
    <PageHero eyebrow="ABOUT" title="From Software Engineering to Quality Leadership" description={data.profile.summary} />
    <section className="shell about-grid">
      <article className="bento-card profile-card">
        <img src={assetPath(data.profile.image)} alt={data.profile.name} />
        <h2>{data.profile.name}</h2>
        <div className="profile-meta"><span>{data.profile.title}</span></div>
        <div className="profile-meta"><ProfessionalIcon name="enterprise" className="meta-icon" /><span>{data.experience[0]?.company}</span></div>
        <div className="profile-meta"><ProfessionalIcon name="location" className="meta-icon" /><span>{data.profile.location}</span></div>
      </article>
      <article className="bento-card large icon-card">
        <ProfessionalIcon name="profile" className="icon-badge" />
        <h2>Professional Profile</h2>
        <p>{data.profile.heroDescription}</p>
        <p>My work spans software testing, SDLC, enterprise implementations, automation, performance engineering, documentation, stakeholder collaboration, mentoring and release readiness.</p>
      </article>
    </section>
    <section className="shell bento-section">
      <div className="section-heading"><div><h3 className="eyebrow">TECHNICAL EXPERTISE</h3><h2>Capabilities grouped by outcomes</h2></div></div>
      <div className="skill-grid">{data.skills.map((s) => <article className="bento-card icon-card" key={s.group}><div className="card-title-row"><ProfessionalIcon name={skillIcon(s.group)} className="icon-badge" /><h3>{s.group}</h3></div><div className="tags roomy">{s.items.map((i) => <span key={i}>{i}</span>)}</div></article>)}</div>
    </section>
  </main><SiteFooter /></>;
}
