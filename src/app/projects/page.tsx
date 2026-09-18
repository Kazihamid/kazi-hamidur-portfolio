"use client";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHero } from "@/components/PageHero";
import { ProfessionalIcon, type IconName } from "@/components/ProfessionalIcon";
import { usePortfolio } from "@/context/PortfolioContext";

function projectIcon(category:string,title:string):IconName{
  const text=`${category} ${title}`.toLowerCase();
  if(text.includes("automation")) return "automation";
  if(text.includes("performance")) return "performance";
  if(text.includes("api")) return "api";
  if(text.includes("recruit")||text.includes("hrms")||text.includes("enterprise")) return "enterprise";
  if(text.includes("procurement")||text.includes("tender")) return "project";
  return "project";
}

export default function Projects(){
  const {data}=usePortfolio();
  const [filter,setFilter]=useState("All");
  const cats=useMemo(()=>["All",...Array.from(new Set(data.projects.map(p=>p.category)))],[data.projects]);
  const shown=filter==="All"?data.projects:data.projects.filter(p=>p.category===filter);
  return <><SiteHeader/><main>
    <PageHero eyebrow="PROJECTS" title="Selected Work & Quality Engineering" description="Enterprise systems, automation, API validation and performance engineering presented as focused professional work areas."/>
    <section className="shell">
      <div className="filter-row">{cats.map(c=><button key={c} onClick={()=>setFilter(c)} className={filter===c?"filter active":"filter"}>{c}</button>)}</div>
      <div className="project-grid">{shown.map(p=><article className="bento-card project-card icon-card" key={p.id}>
        <div className="card-icon-row"><ProfessionalIcon name={projectIcon(p.category,p.title)} className="icon-badge"/><span className="pill">{p.category}</span></div>
        <h2>{p.title}</h2><p>{p.description}</p><div className="tags">{p.tools.map(t=><span key={t}>{t}</span>)}</div>
      </article>)}</div>
    </section>
  </main><SiteFooter/></>;
}
