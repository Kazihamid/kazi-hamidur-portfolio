"use client";

import { useRef, useState } from "react";
import { usePortfolio, type Recommendation } from "@/context/PortfolioContext";

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function pick(row: string[], headers: string[], candidates: string[]) {
  const index = headers.findIndex((header) => candidates.some((candidate) => header.includes(candidate)));
  return index >= 0 ? row[index]?.trim() ?? "" : "";
}

export default function RecommendationsEditor() {
  const { data, update } = usePortfolio();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  function addRecommendation() {
    update((draft) => {
      draft.recommendations.unshift({
        id: `recommendation-${Date.now()}`,
        name: "New Recommender",
        headline: "Role / organization",
        relationship: "Professional relationship",
        date: new Date().toISOString().slice(0, 10),
        text: "Add the recommendation text.",
        source: "LinkedIn",
        image: "",
      });
    });
  }

  function importLinkedInCsv(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseCsv(String(reader.result ?? ""));
        if (rows.length < 2) throw new Error("No recommendation rows found");
        const headers = rows[0].map((header) => header.trim().toLowerCase());
        const imported: Recommendation[] = rows.slice(1).map((row, index) => {
          const first = pick(row, headers, ["first name", "firstname"]);
          const last = pick(row, headers, ["last name", "lastname"]);
          const company = pick(row, headers, ["company", "organization"]);
          const description = pick(row, headers, ["description", "recommendation"]);
          const published = pick(row, headers, ["published date", "date"]);
          const name = `${first} ${last}`.trim() || `LinkedIn Recommender ${index + 1}`;
          return {
            id: `linkedin-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${published || index}`,
            name,
            headline: company || "LinkedIn connection",
            relationship: "LinkedIn recommendation",
            date: published || "",
            text: description,
            source: "LinkedIn",
            image: "",
          };
        }).filter((item) => item.text);

        if (!imported.length) throw new Error("No recommendation descriptions found");
        update((draft) => { draft.recommendations = imported; });
        setMessage(`${imported.length} LinkedIn recommendation${imported.length === 1 ? "" : "s"} imported. Review them, then click Save Draft.`);
      } catch {
        setMessage("Could not import the CSV. Use LinkedIn's Recommendations Received export or add recommendations manually.");
      }
    };
    reader.readAsText(file);
  }

  return <>
    <div className="setup-header">
      <div>
        <span className="eyebrow">RECOMMENDATIONS</span>
        <h1>Recommendation Manager</h1>
        <p>Maintain professional recommendations shown on the public portfolio.</p>
      </div>
      <button className="button compact" onClick={addRecommendation}>+ Add Recommendation</button>
    </div>

    <section className="admin-card linkedin-sync-card">
      <div>
        <h2>LinkedIn recommendations</h2>
        <p>Import the <strong>Recommendations Received</strong> CSV from your LinkedIn data export to refresh the full list.</p>
        <p className="muted">Automatic background synchronization is not available from this static GitHub Pages site because LinkedIn recommendations require authenticated/approved LinkedIn access.</p>
      </div>
      <div className="actions wrap">
        <button className="button secondary" onClick={() => inputRef.current?.click()}>Import LinkedIn Recommendations CSV</button>
        <a className="button secondary" href={data.profile.linkedin} target="_blank" rel="noreferrer">Open LinkedIn ↗</a>
        <input ref={inputRef} hidden type="file" accept=".csv,text/csv" onChange={(event) => importLinkedInCsv(event.target.files?.[0])}/>
      </div>
      {message && <p className="notice">{message}</p>}
    </section>

    <section className="admin-list recommendations-admin-list">
      {data.recommendations.map((item, index) => <article className="admin-card recommendation-editor" key={item.id}>
        <div className="recommendation-editor-grid">
          <label>Name
            <input value={item.name} onChange={(event) => update((draft) => { draft.recommendations[index].name = event.target.value; })}/>
          </label>
          <label>Role / Organization
            <input value={item.headline} onChange={(event) => update((draft) => { draft.recommendations[index].headline = event.target.value; })}/>
          </label>
          <label>Recommendation Date
            <input type="date" value={item.date} onChange={(event) => update((draft) => { draft.recommendations[index].date = event.target.value; })}/>
          </label>
          <label>Relationship
            <input value={item.relationship} onChange={(event) => update((draft) => { draft.recommendations[index].relationship = event.target.value; })}/>
          </label>
          <label className="recommendation-image-field">Recommender Image URL / Repository Path
            <input value={item.image ?? ""} placeholder="/images/recommendations/name.png" onChange={(event) => update((draft) => { draft.recommendations[index].image = event.target.value; })}/>
          </label>
        </div>
        <label>Recommendation Text
          <textarea rows={5} value={item.text} onChange={(event) => update((draft) => { draft.recommendations[index].text = event.target.value; })}/>
        </label>
        <div className="recommendation-editor-footer">
          <span className="pill">{item.source || "Professional Recommendation"}</span>
          <button className="danger" onClick={() => update((draft) => { draft.recommendations.splice(index, 1); })}>Remove</button>
        </div>
      </article>)}
    </section>
  </>;
}
