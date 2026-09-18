"use client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHero } from "@/components/PageHero";
import { usePortfolio } from "@/context/PortfolioContext";

export default function Experience(){
  const {data}=usePortfolio();
  return <><SiteHeader/><main>
    <PageHero eyebrow="EXPERIENCE" title="A Journey of Growth" description="From software development to QA leadership — a career shaped by continuous learning, enterprise delivery and increasing responsibility."/>
    <section className="shell timeline">{data.experience.map((e,i)=><article className="timeline-item" key={`${e.role}-${e.start}`}>
      <div className="timeline-marker"><span>{String(i+1).padStart(2,'0')}</span></div>
      <div className="timeline-content">
        <div className="timeline-dates">{e.start} — {e.end}</div><h2>{e.role}</h2><h3>{e.company}</h3>
        <p>{e.summary}</p>
        <div className="tags">{e.focus.map(f=><span key={f}>{f}</span>)}</div>
      </div>
    </article>)}</section>
  </main><SiteFooter/></>;
}
