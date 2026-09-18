"use client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHero } from "@/components/PageHero";
import { usePortfolio } from "@/context/PortfolioContext";
import { assetPath } from "@/lib/paths";

export default function About() {
  const { data } = usePortfolio();
  return <><SiteHeader /><main>
    <PageHero eyebrow="ABOUT" title="From Software Engineering to Quality Leadership" description={data.profile.summary} />
    <section className="shell about-grid">
      <article className="bento-card profile-card">
        <img src={assetPath(data.profile.image)} alt={data.profile.name} />
        <h2>{data.profile.name}</h2><p>{data.profile.title}</p><p>{data.profile.location}</p>
      </article>
      <article className="bento-card large"><h2>Professional Profile</h2><p>{data.profile.heroDescription}</p><p>My work spans software testing, SDLC, enterprise implementations, automation, performance engineering, documentation, stakeholder collaboration, mentoring and release readiness.</p></article>
    </section>
    <section className="shell bento-section">
      <div className="section-heading"><div><h3 className="eyebrow">TECHNICAL EXPERTISE</h3><h2>Capabilities grouped by outcomes</h2></div></div>
      <div className="skill-grid">{data.skills.map((s) => <article className="bento-card" key={s.group}><h3>{s.group}</h3><div className="tags roomy">{s.items.map((i) => <span key={i}>{i}</span>)}</div></article>)}</div>
    </section>
  </main><SiteFooter /></>;
}
