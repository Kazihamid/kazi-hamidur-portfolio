"use client";

import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHero } from "@/components/PageHero";
import { ProfessionalIcon, type IconName } from "@/components/ProfessionalIcon";
import { usePortfolio } from "@/context/PortfolioContext";
import { formatProjectPeriod, sortProjectsRecentFirst } from "@/lib/projectDates";

function projectIcon(category:string,title:string):IconName{
  const text=`${category} ${title}`.toLowerCase();
  if(text.includes("automation")) return "automation";
  if(text.includes("performance")) return "performance";
  if(text.includes("api")) return "api";
  if(text.includes("recruit")||text.includes("hrms")||text.includes("enterprise")) return "enterprise";
  if(text.includes("procurement")||text.includes("tender")) return "project";
  return "project";
}

function projectTone(category:string,title:string){
  const text=`${category} ${title}`.toLowerCase();
  if(text.includes("automation")) return "project-tone-violet";
  if(text.includes("api")) return "project-tone-green";
  if(text.includes("performance")) return "project-tone-cyan";
  if(text.includes("procurement")||text.includes("tender")) return "project-tone-blue";
  return "project-tone-blue";
}

function ProjectDescription({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  return <div className="project-description" aria-label="Project description">
    {lines.map((line,index)=><span className="project-description-line" key={`${index}-${line.slice(0,20)}`}>{line || "\u00A0"}</span>)}
  </div>;
}

export default function Projects(){
  const {data}=usePortfolio();
  const [filter,setFilter]=useState("All");
  const cats=useMemo(()=>["All",...Array.from(new Set(data.projects.map(p=>p.category)))],[data.projects]);
  const sorted=useMemo(()=>sortProjectsRecentFirst(data.projects),[data.projects]);
  const shown=filter==="All"?sorted:sorted.filter(p=>p.category===filter);

  return <><SiteHeader/><main className="projects-page">
    <PageHero eyebrow="PROJECTS" title="Selected Work & Quality Engineering" description="Enterprise systems, automation, API validation and performance engineering presented as focused professional work areas."/>
    <section className="shell">
      <div className="filter-row">{cats.map(c=><button key={c} onClick={()=>setFilter(c)} className={filter===c?"filter active":"filter"}>{c}</button>)}</div>
      <div className="project-grid">{shown.map(p=>{
        const period=formatProjectPeriod(p);
        return <article className={`bento-card project-card icon-card ${period?"has-project-period":""}`} key={p.id}>
          <div className="card-icon-row"><ProfessionalIcon name={projectIcon(p.category,p.title)} className={`icon-badge ${projectTone(p.category,p.title)}`}/><span className="pill">{p.category}</span></div>
          <h2>{p.title}</h2>
          <ProjectDescription text={p.description}/>
          <div className="tags">{p.tools.map(t=><span key={t}>{t}</span>)}</div>
          {period&&<span className="project-period">{period}</span>}
        </article>;
      })}</div>
    </section>
  </main><SiteFooter/></>;
}
