"use client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProfessionalIcon, type IconName } from "@/components/ProfessionalIcon";
import { usePortfolio } from "@/context/PortfolioContext";
import { assetPath } from "@/lib/paths";

const philosophyIcons: IconName[] = ["quality","risk","shift","improvement"];
const leadIcons: IconName[] = ["strategy","shield","automation","release","collaboration","report"];
const mentoringIcons: IconName[] = ["mentor","review","automation","knowledge","career","leadership"];

export default function Leadership() {
  const { data } = usePortfolio();
  const l = data.leadership;
  return <><SiteHeader /><main>
    <section className="lead-hero"><div className="shell hero-grid">
      <div><h3 className="eyebrow">LEADERSHIP</h3><h1>{l.title}</h1><p className="hero-copy">{l.subtitle}</p></div>
      <div className="portrait-wrap"><img src={assetPath(data.profile.image)} alt={data.profile.name} /></div>
    </div></section>

    <section className="shell bento-section">
      <div className="section-heading"><div><h3 className="eyebrow">01 · PHILOSOPHY</h3><h2>My QA Leadership Philosophy</h2></div></div>
      <div className="principle-grid">{l.philosophy.map((p,index)=><article className="bento-card philosophy-card" key={p.title}><ProfessionalIcon name={philosophyIcons[index] ?? "quality"} className={`icon-badge icon-tone-${(index%4)+1}`} /><h3>{p.title}</h3><p>{p.text}</p></article>)}</div>
    </section>

    <section className="shell bento-card large process-card">
      <div className="card-title-row no-leading-icon"><div><h3 className="eyebrow">02 · HOW I THINK ABOUT QUALITY</h3><h2>From requirements to continuous improvement</h2></div></div>
      <div className="process-flow">{l.process.map((p,i)=><div className="process-step" key={p}><span>{String(i+1).padStart(2,"0")}</span><strong>{p}</strong></div>)}</div>
    </section>

    <section className="shell split-section">
      <article className="bento-card large">
        <div className="card-title-row no-leading-icon"><div><h3 className="eyebrow">03 · HOW I LEAD QA</h3><h2>Turning quality strategy into execution</h2></div></div>
        <div className="list-grid">{l.leadAreas.map((x,i)=><div className="icon-list-item" key={x}><ProfessionalIcon name={leadIcons[i] ?? "check"} className="list-icon"/><span>{x}</span></div>)}</div>
      </article>
      <article className="bento-card large">
        <div className="card-title-row no-leading-icon"><div><h3 className="eyebrow">04 · MENTORING</h3><h2>Growing people and stronger teams</h2></div></div>
        <div className="list-grid">{l.mentoring.map((x,i)=><div className="icon-list-item" key={x}><ProfessionalIcon name={mentoringIcons[i] ?? "mentor"} className="list-icon"/><span>{x}</span></div>)}</div>
      </article>
    </section>

    <section className="shell bento-section">
      <div className="section-heading"><div><h3 className="eyebrow">05 · PRINCIPLES</h3><h2>Leadership principles</h2></div></div>
      <div className="principle-grid">{l.principles.map((x)=><blockquote className="bento-card quote icon-card" key={x}><ProfessionalIcon name="quote" className="quote-icon"/>{x}</blockquote>)}</div>
    </section>

    <section className="shell cta"><div className="cta-copy"><div><h3 className="eyebrow">BUILDING QUALITY TEAMS</h3><h2>Not Just Testing Products.</h2><p>Quality leadership connects strategy, people, process and technology to create reliable software and sustainable delivery capability.</p></div></div><a className="button" href={`mailto:${data.profile.email}`}>Let&apos;s Connect</a></section>
  </main><SiteFooter /></>;
}
