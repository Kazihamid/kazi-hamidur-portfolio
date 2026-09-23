"use client";

import { usePortfolio } from "@/context/PortfolioContext";

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
      {data.projects.map((p,i)=><article className="admin-card project-editor" key={p.id}>
        <div className="project-editor-main">
          <label>Project Title
            <input className="title-input" value={p.title} onChange={e=>update(d=>{d.projects[i].title=e.target.value})}/>
          </label>
          <label>Category
            <input value={p.category} onChange={e=>update(d=>{d.projects[i].category=e.target.value})}/>
          </label>
          <div className="project-date-grid">
            <label>Start Date
              <input type="month" value={p.startDate??""} onChange={e=>update(d=>{d.projects[i].startDate=e.target.value})}/>
            </label>
            <label>End Date
              <input type="month" value={p.endDate??""} onChange={e=>update(d=>{d.projects[i].endDate=e.target.value})}/>
            </label>
          </div>
          <small className="project-date-help">Use the month picker. Leave End Date blank for an ongoing project (Present).</small>
          <label>Project Description
            <textarea rows={7} value={p.description} onChange={e=>update(d=>{d.projects[i].description=e.target.value})}/>
          </label>
        </div>
        <div className="project-controls">
          <label className="check"><input type="checkbox" checked={p.featured} onChange={e=>update(d=>{d.projects[i].featured=e.target.checked})}/> Featured</label>
          <button className="danger" onClick={()=>update(d=>{d.projects.splice(i,1)})}>Remove</button>
        </div>
      </article>)}
    </section>
  </>;
}
