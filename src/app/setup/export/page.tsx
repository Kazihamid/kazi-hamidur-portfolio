"use client";

import { useEffect, useRef, useState } from "react";
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
  const [isLocalWorkspace, setIsLocalWorkspace] = useState(false);
  const [canWriteFile, setCanWriteFile] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const local = hostname === "localhost" || hostname === "127.0.0.1";
    setIsLocalWorkspace(local);
    setCanWriteFile(local && "showSaveFilePicker" in window);
  }, []);

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

    if (!isLocalWorkspace) {
      downloadRepositoryJson(data);
      setMessage(
        "Hosted GitHub Pages cannot write into your local Git repository. portfolio.json was downloaded. Copy it to your local project at src/data/portfolio.json, replace the existing file, then commit and push the change."
      );
      return;
    }

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
        "This browser does not support direct file replacement. portfolio.json was downloaded. Replace src/data/portfolio.json manually, then run git status."
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
          <h2>{isLocalWorkspace ? "Update Codebase" : "Prepare Codebase Update"}</h2>
          {isLocalWorkspace ? (
            <p>
              Save the current Setup data into the repository&apos;s <strong>src/data/portfolio.json</strong> file.
              When the file picker opens, select that existing file and confirm Replace/Save.
            </p>
          ) : (
            <p>
              This hosted GitHub Pages site cannot directly modify files inside your local Git repository.
              Download the generated <strong>portfolio.json</strong>, then replace
              <strong> src/data/portfolio.json</strong> in your local project before committing and pushing.
            </p>
          )}
          <div className="actions wrap">
            <button className="button" disabled={writing} onClick={updateCodebaseJson}>
              {writing
                ? "Writing…"
                : isLocalWorkspace && canWriteFile
                  ? "Update Codebase JSON"
                  : "Download for Codebase"}
            </button>
            {isLocalWorkspace && (
              <button className="button secondary" onClick={() => downloadRepositoryJson(data)}>
                Download portfolio.json
              </button>
            )}
          </div>
          <p className="muted">
            {isLocalWorkspace ? (
              <>
                After updating the codebase, run <strong>git status</strong>. You should see
                <strong> src/data/portfolio.json</strong> as modified.
              </>
            ) : (
              <>
                Local path: <strong>src/data/portfolio.json</strong>. After replacing it, run
                <strong> git status</strong>, then commit and push your branch.
              </>
            )}
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
