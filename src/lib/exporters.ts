import type { PortfolioData } from "@/context/PortfolioContext";

function download(content: BlobPart, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportJson(data: PortfolioData) {
  download(JSON.stringify(data, null, 2), "kazi-hamidur-portfolio.json", "application/json");
}

export function exportProjectsCsv(data: PortfolioData) {
  const esc=(v:string)=>`"${String(v).replaceAll('"','""')}"`;
  const rows=[
    ["Title","Category","Start Date","End Date","Description","Tools","Featured"],
    ...data.projects.map(p=>[
      p.title,
      p.category,
      p.startDate || "",
      p.endDate || "",
      p.description,
      p.tools.join(" | "),
      String(p.featured),
    ]),
  ];
  download(rows.map(r=>r.map(esc).join(",")).join("\n"),"portfolio-projects.csv","text/csv;charset=utf-8");
}

export function exportExcelCompatible(data: PortfolioData) {
  const tables = [
    ["Experience", [["Role","Company","Start","End"], ...data.experience.map(e=>[e.role,e.company,e.start,e.end])]],
    ["Projects", [["Title","Category","Start Date","End Date","Description"], ...data.projects.map(p=>[p.title,p.category,p.startDate || "",p.endDate || "",p.description])]],
    ["Certifications", [["Certification","Issuer","Year"], ...data.certifications.map(c=>[c.name,c.issuer,c.year])]],
    ["Recommendations", [["Name","Role / Organization","Relationship","Date","Recommendation"], ...data.recommendations.map(r=>[r.name,r.headline,r.relationship,r.date,r.text])]],
  ] as const;
  const html = `<html><head><meta charset="UTF-8"></head><body>${tables.map(([name,rows])=>`<h2>${name}</h2><table border="1">${rows.map(r=>`<tr>${r.map(c=>`<td>${String(c)}</td>`).join("")}</tr>`).join("")}</table>`).join("")}</body></html>`;
  download(html,"kazi-hamidur-portfolio.xls","application/vnd.ms-excel");
}
