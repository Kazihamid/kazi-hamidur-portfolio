"use client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHero } from "@/components/PageHero";
import { ProfessionalIcon } from "@/components/ProfessionalIcon";
import { usePortfolio } from "@/context/PortfolioContext";

function latestYear(value:string){
  const years=value.match(/\d{4}/g)?.map(Number) ?? [];
  return years.length ? Math.max(...years) : 0;
}

export default function Certifications(){
  const {data}=usePortfolio();
  const certifications=[...data.certifications].sort((a,b)=>latestYear(b.year)-latestYear(a.year));
  return <><SiteHeader/><main>
    <PageHero eyebrow="CONTINUOUS LEARNING" title="Certifications & Professional Development" description="Professional certifications, management development and technical learning across quality engineering, Agile, leadership and information security."/>
    <section className="shell cert-grid">{certifications.map(c=><article className="bento-card" key={c.name}><div className="card-icon-row certification-card-row"><span className="pill">{c.year}</span></div><h2>{c.name}</h2><p>{c.issuer}</p></article>)}</section>
    <section className="shell bento-section"><div className="section-heading"><div><h3 className="eyebrow">EDUCATION</h3><h2>Academic foundation</h2></div></div><div className="split-section">{data.education.map(e=><article className="bento-card large icon-card" key={e.degree}><ProfessionalIcon name="education" className="icon-badge icon-violet"/><h3>{e.degree}</h3><p>{e.school}</p><strong>{e.year}</strong></article>)}</div></section>
  </main><SiteFooter/></>;
}
