"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePortfolio, type PortfolioData } from "@/context/PortfolioContext";
import { exportExcelCompatible, exportJson, exportProjectsCsv } from "@/lib/exporters";

function downloadRepositoryJson(data: PortfolioData) {
  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "portfolio.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function ExportCenter() {
  const { data, replace, reset } = usePortfolio();
  const ref = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [writing, setWriting] = useState(false);

  function importJson(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        replace(JSON.parse(String(reader.result)) as PortfolioData);
        setMessage(
          "Configuration imported. Click Save Draft to store it in this browser. To make the same changes appear in Git, use Update Codebase JSON below."
        );
      } catch {
        setMessage("Import failed: invalid portfolio JSON.");
      }
    };
    reader.readAsText(file);
  }

  async function updateCodebaseJson() {
    const json = `${JSON.stringify(data, null, 2)}\n`;
    const picker = (window as typeof window & {
      showSaveFilePicker?: (options?: unknown) => Promise<{
        createWritable: () => Promise<{
          write: (content: string) => Promise<void>;
          close: () => Promise<void>;
        }>;
      }>;
    }).showSaveFilePicker;

    if (!picker) {
      downloadRepositoryJson(data);
      setMessage(
        "Your browser cannot write directly to a repository file. portfolio.json was downloaded. Replace src/data/portfolio.json with that file, then run git status."
      );
      return;
    }

    try {
      setWriting(true);
      const handle = await picker({
        suggestedName: "portfolio.json",
        types: [
          {
            description: "Portfolio JSON",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
      setMessage(
        "Codebase JSON updated. If you selected your project's src/data/portfolio.json file, Git should now show it as modified. Run: git status"
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setMessage("Codebase update cancelled. No repository file was changed.");
      } else {
        setMessage(
          "Could not write the repository file. Use Download portfolio.json and manually replace src/data/portfolio.json."
        );
      }
    } finally {
      setWriting(false);
    }
  }

  return (
    <>
      <div className="setup-header">
        <div>
          <span className="eyebrow">PORTABILITY</span>
          <h1>Import / Export Center</h1>
          <p>Back up your portfolio, update the repository data file, and export professional data.</p>
        </div>
      </div>

      <section className="export-grid">
        <article className="admin-card">
          <h2>Portfolio Backup</h2>
          <p>JSON is the complete portable configuration format for browser drafts.</p>
          <div className="actions">
            <button className="button" onClick={() => exportJson(data)}>Export JSON</button>
            <button className="button secondary" onClick={() => ref.current?.click()}>Import JSON</button>
            <input
              ref={ref}
              type="file"
              accept="application/json"
              hidden
              onChange={(event) => importJson(event.target.files?.[0])}
            />
          </div>
        </article>

        <article className="admin-card">
          <h2>Update Codebase</h2>
          <p>
            Save the current Setup data into the repository&apos;s <strong>src/data/portfolio.json</strong> file.
            When the file picker opens, select that existing file and confirm Replace/Save.
          </p>
          <div className="actions wrap">
            <button className="button" disabled={writing} onClick={updateCodebaseJson}>
              {writing ? "Writing…" : "Update Codebase JSON"}
            </button>
            <button className="button secondary" onClick={() => downloadRepositoryJson(data)}>
              Download portfolio.json
            </button>
          </div>
          <p className="muted">
            After updating the codebase, run <strong>git status</strong>. You should see
            <strong> src/data/portfolio.json</strong> as modified.
          </p>
        </article>

        <article className="admin-card">
          <h2>Professional Exports</h2>
          <p>Generate data files suitable for sharing and analysis.</p>
          <div className="actions wrap">
            <Link className="button" href="/resume" target="_blank">PDF / Print View</Link>
            <button className="button secondary" onClick={() => exportExcelCompatible(data)}>Excel (.xls)</button>
            <button className="button secondary" onClick={() => exportProjectsCsv(data)}>Projects CSV</button>
          </div>
        </article>

        <article className="admin-card">
          <h2>Reset Draft</h2>
          <p>Restore the repository defaults and remove browser-only edits.</p>
          <button
            className="danger"
            onClick={() => {
              if (confirm("Reset local portfolio draft?")) reset();
            }}
          >
            Reset to Defaults
          </button>
        </article>
      </section>

      {message && <p className="notice">{message}</p>}
    </>
  );
}
