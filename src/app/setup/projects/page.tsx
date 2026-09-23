"use client";

import { useEffect, useMemo, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";

const MONTHS = [
  ["01", "January"],
  ["02", "February"],
  ["03", "March"],
  ["04", "April"],
  ["05", "May"],
  ["06", "June"],
  ["07", "July"],
  ["08", "August"],
  ["09", "September"],
  ["10", "October"],
  ["11", "November"],
  ["12", "December"],
] as const;

const CURRENT_YEAR = new Date().getFullYear() + 1;
const YEARS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, index) => String(CURRENT_YEAR - index));

type DateParts = { year: string; month: string };
type ProjectDateDraft = { start: DateParts; end: DateParts };
type DateDraftMap = Record<string, ProjectDateDraft>;

function splitYearMonth(value?: string): DateParts {
  const match = /^\s*(\d{4})-(\d{2})\s*$/.exec(value ?? "");
  return { year: match?.[1] ?? "", month: match?.[2] ?? "" };
}

function combineYearMonth(parts: DateParts) {
  return parts.year && parts.month ? `${parts.year}-${parts.month}` : "";
}

function draftsFromProjects(projects: Array<{ id: string; startDate?: string; endDate?: string }>): DateDraftMap {
  return Object.fromEntries(
    projects.map((project) => [
      project.id,
      {
        start: splitYearMonth(project.startDate),
        end: splitYearMonth(project.endDate),
      },
    ])
  );
}

export default function ProjectsEditor(){
  const {data,update}=usePortfolio();
  const dateSignature = useMemo(
    () => data.projects.map((project) => `${project.id}:${project.startDate ?? ""}:${project.endDate ?? ""}`).join("|"),
    [data.projects]
  );
  const [dateDrafts, setDateDrafts] = useState<DateDraftMap>(() => draftsFromProjects(data.projects));

  useEffect(() => {
    setDateDrafts(draftsFromProjects(data.projects));
  }, [dateSignature]);

  function add(){
    update(d=>d.projects.unshift({
      id:`project-${Date.now()}`,
      title:"New Project",
      category:"Other",
      description:"Add a professional project description.",
      tools:[],
      featured:false,
      startDate:"",
      endDate:"",
    }));
  }

  function setProjectDate(
    index:number,
    projectId:string,
    range:"start"|"end",
    part:"year"|"month",
    value:string
  ){
    const existing = dateDrafts[projectId] ?? {
      start: splitYearMonth(data.projects[index].startDate),
      end: splitYearMonth(data.projects[index].endDate),
    };
    const nextRange: DateParts = { ...existing[range], [part]: value };
    const nextDraft: ProjectDateDraft = { ...existing, [range]: nextRange };

    setDateDrafts((current) => ({ ...current, [projectId]: nextDraft }));

    // Only write a date to portfolio.json when both values are selected.
    // This keeps the first dropdown choice visible while the user chooses the second.
    if (nextRange.year && nextRange.month) {
      update((draft) => {
        draft.projects[index][range === "start" ? "startDate" : "endDate"] = combineYearMonth(nextRange);
      });
    } else if (!nextRange.year && !nextRange.month) {
      update((draft) => {
        draft.projects[index][range === "start" ? "startDate" : "endDate"] = "";
      });
    }
  }

  return <>
    <div className="setup-header">
      <div>
        <span className="eyebrow">PROJECTS</span>
        <h1>Project Manager</h1>
        <p>Add, edit, feature or remove portfolio work. Public project lists are automatically sorted from most recent to oldest using the dates below.</p>
      </div>
      <button className="button compact" onClick={add}>+ Add Project</button>
    </div>

    <section className="admin-list">
      {data.projects.map((p,i)=>{
        const draft = dateDrafts[p.id] ?? {
          start: splitYearMonth(p.startDate),
          end: splitYearMonth(p.endDate),
        };

        return <article className="admin-card project-editor" key={p.id}>
          <div className="project-editor-main">
            <label>Project Title
              <input className="title-input" value={p.title} onChange={e=>update(d=>{d.projects[i].title=e.target.value})}/>
            </label>
            <label>Category
              <input value={p.category} onChange={e=>update(d=>{d.projects[i].category=e.target.value})}/>
            </label>
            <div className="project-date-grid">
              <label>Start Date
                <div className="project-date-field">
                  <select
                    aria-label="Start month"
                    value={draft.start.month}
                    onChange={e=>setProjectDate(i,p.id,"start","month",e.target.value)}
                  >
                    <option value="">Month</option>
                    {MONTHS.map(([month,label]) => <option key={month} value={month}>{label}</option>)}
                  </select>
                  <select
                    aria-label="Start year"
                    value={draft.start.year}
                    onChange={e=>setProjectDate(i,p.id,"start","year",e.target.value)}
                  >
                    <option value="">Year</option>
                    {YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
              </label>
              <label>End Date
                <div className="project-date-field">
                  <select
                    aria-label="End month"
                    value={draft.end.month}
                    onChange={e=>setProjectDate(i,p.id,"end","month",e.target.value)}
                  >
                    <option value="">Month</option>
                    {MONTHS.map(([month,label]) => <option key={month} value={month}>{label}</option>)}
                  </select>
                  <select
                    aria-label="End year"
                    value={draft.end.year}
                    onChange={e=>setProjectDate(i,p.id,"end","year",e.target.value)}
                  >
                    <option value="">Year</option>
                    {YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
              </label>
            </div>
            <small className="project-date-help">Select both Month and Year, then click Save Draft. Leave End Date blank for an ongoing project (Present).</small>
            <label>Project Description
              <textarea rows={7} value={p.description} onChange={e=>update(d=>{d.projects[i].description=e.target.value})}/>
            </label>
          </div>
          <div className="project-controls">
            <label className="check"><input type="checkbox" checked={p.featured} onChange={e=>update(d=>{d.projects[i].featured=e.target.checked})}/> Featured</label>
            <button className="danger" onClick={()=>update(d=>{d.projects.splice(i,1)})}>Remove</button>
          </div>
        </article>
      })}
    </section>
  </>;
}
