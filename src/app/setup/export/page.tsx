"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePortfolio, type PortfolioData } from "@/context/PortfolioContext";
import { exportExcelCompatible, exportJson, exportProjectsCsv } from "@/lib/exporters";

const GITHUB_EDIT_URL =
  "https://github.com/Kazihamid/kazi-hamidur-portfolio/edit/main/src/data/portfolio.json";

function portfolioJsonText(data: PortfolioData) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

function downloadRepositoryJson(data: PortfolioData) {
  const blob = new Blob([portfolioJsonText(data)], {
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

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export default function ExportCenter() {
  const { data, replace, reset } = usePortfolio();
  const ref = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [writing, setWriting] = useState(false);
  const [isLocalWorkspace, setIsLocalWorkspace] = useState(false);
  const [canWriteFile, setCanWriteFile] = useState(false);
  const [copied, setCopied] = useState(false);

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
          "Configuration imported. Click Save Draft to keep it in this browser before publishing."
        );
      } catch {
        setMessage("Import failed: invalid portfolio JSON.");
      }
    };
    reader.readAsText(file);
  }

  async function updateLocalCodebaseJson() {
    const json = portfolioJsonText(data);
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
        "This browser cannot replace a local file directly. portfolio.json was downloaded; replace src/data/portfolio.json manually."
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
        "Codebase JSON updated. Run git status and confirm src/data/portfolio.json is modified."
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setMessage("Codebase update cancelled. No repository file was changed.");
      } else {
        setMessage(
          "Could not write the repository file. Use Download portfolio.json and replace src/data/portfolio.json manually."
        );
      }
    } finally {
      setWriting(false);
    }
  }

  async function copyForGitHub() {
    try {
      await copyText(portfolioJsonText(data));
      setCopied(true);
      setMessage(
        "Current portfolio JSON copied. Open the GitHub editor, select all existing JSON, paste, then click Commit changes."
      );
    } catch {
      setCopied(false);
      setMessage(
        "Clipboard access was blocked by the browser. Use Download JSON instead, then copy its contents into the GitHub editor."
      );
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
          <div className="actions wrap">
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
          <h2>{isLocalWorkspace ? "Update Local Codebase" : "Publish Data to GitHub"}</h2>

          {isLocalWorkspace ? (
            <>
              <p>
                Save the current Setup data directly into the local repository file
                <strong> src/data/portfolio.json</strong>.
              </p>
              <div className="actions wrap">
                <button className="button" disabled={writing} onClick={updateLocalCodebaseJson}>
                  {writing ? "Writing…" : canWriteFile ? "Update Codebase JSON" : "Download portfolio.json"}
                </button>
                <button className="button secondary" onClick={() => downloadRepositoryJson(data)}>
                  Download Backup
                </button>
              </div>
              <p className="muted">
                After saving, run <strong>git status</strong> and confirm
                <strong> src/data/portfolio.json</strong> is modified.
              </p>
            </>
          ) : (
            <>
              <p>
                GitHub Pages cannot write directly into the repository. Use this safe two-step flow instead:
                copy the current JSON, then paste it into GitHub&apos;s editor for
                <strong> src/data/portfolio.json</strong>.
              </p>

              <div className="actions wrap">
                <button className="button" onClick={copyForGitHub}>
                  {copied ? "✓ JSON Copied" : "1. Copy Current JSON"}
                </button>
                <a
                  className="button secondary"
                  href={GITHUB_EDIT_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  2. Open GitHub Editor
                </a>
                <button className="button secondary" onClick={() => downloadRepositoryJson(data)}>
                  Download Backup
                </button>
              </div>

              <div className="notice" style={{ marginTop: 14 }}>
                <strong>In GitHub:</strong> press Ctrl+A inside the editor, paste the copied JSON, then choose
                <strong> Commit changes</strong>. If GitHub asks, create a branch / pull request and merge it to main.
              </div>
            </>
          )}
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
