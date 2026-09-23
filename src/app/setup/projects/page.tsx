"use client";

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

function splitYearMonth(value?: string) {
  const match = /^\s*(\d{4})-(\d{2})\s*$/.exec(value ?? "");
  return {
    year: match?.[1] ?? "",
    month: match?.[2] ?? "",
  };
}

function combineYearMonth(year: string, month: string) {
  if (!year || !month) return "";
  return `${year}-${month}`;
}

export default function ProjectsEditor(){
  const {data,update}=usePortfolio();

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

  function setProjectDate(index:number, key:"startDate"|"endDate", part:"year"|"month", value:string){
    update(d=>{
      const current = splitYearMonth(d.projects[index][key] ?? "");
      const next = {
        ...current,
        [part]: value,
      };
      d.projects[index][key] = combineYearMonth(next.year, next.month);
    });
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
        const start = splitYearMonth(p.startDate);
        const end = splitYearMonth(p.endDate);

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
                    value={start.month}
                    onChange={e=>setProjectDate(i,"startDate","month",e.target.value)}
                  >
                    <option value="">Month</option>
                    {MONTHS.map(([value,label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <select
                    aria-label="Start year"
                    value={start.year}
                    onChange={e=>setProjectDate(i,"startDate","year",e.target.value)}
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
                    value={end.month}
                    onChange={e=>setProjectDate(i,"endDate","month",e.target.value)}
                  >
                    <option value="">Month</option>
                    {MONTHS.map(([value,label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <select
                    aria-label="End year"
                    value={end.year}
                    onChange={e=>setProjectDate(i,"endDate","year",e.target.value)}
                  >
                    <option value="">Year</option>
                    {YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
              </label>
            </div>
            <small className="project-date-help">Use the month and year selectors. Leave End Date blank for an ongoing project (Present).</small>
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
