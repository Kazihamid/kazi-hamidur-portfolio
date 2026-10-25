"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ProfessionalIcon, type IconName } from "@/components/ProfessionalIcon";
import { usePortfolio } from "@/context/PortfolioContext";
import { AdminLogin } from "@/components/AdminLogin";

const items: Array<[string,string,IconName]> = [
  ["Dashboard","/setup","home"],
  ["Profile","/setup/profile","profile"],
  ["Home","/setup/home","home"],
  ["Experience","/setup/experience","experience"],
  ["Projects","/setup/projects","project"],
  ["Leadership","/setup/leadership","leadership"],
  ["Certifications","/setup/certifications","certificate"],
  ["Recommendations","/setup/recommendations","quote"],
  ["Navigation","/setup/navigation","navigation"],
  ["Import / Export","/setup/export","import"],
];

function formatSavedTime(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function SetupShell({ children }: {children: React.ReactNode}) {
  const path = usePathname();
  const {
    hydrated,
    dirty,
    hasSavedDraft,
    lastSavedAt,
    saveDraft,
    discardChanges,
    reset,
    cloud, authenticated, publishing, status, logout, publish, reloadLive,
  } = usePortfolio();
  const [loginError, setLoginError] = useState("");

  if (cloud && !authenticated) return <AdminLogin />;

  const savedTime = formatSavedTime(lastSavedAt);
  const statusClass = !hydrated ? "loading" : dirty ? "dirty" : "saved";
  const statusTitle = !hydrated
    ? "Loading portfolio draft…"
    : dirty
      ? "Unsaved changes"
      : hasSavedDraft
        ? "Draft saved locally"
        : cloud ? "Live content loaded"
        : "Repository defaults loaded";
  const statusText = !hydrated
    ? "Checking this browser for a saved draft."
    : dirty
      ? cloud ? "You have changes to publish." : "Your edits are not saved yet."
      : hasSavedDraft
        ? savedTime
          ? `Last saved at ${savedTime}. Stored only in this browser.`
          : "Stored only in this browser."
        : cloud ? "Save & Publish makes your changes visible to visitors." : "No browser draft has been saved yet.";

  return <div className="setup-layout"><aside className="setup-sidebar">
    <div className="setup-logo">Portfolio <span>| Kazi Hamidur Rahman</span></div>
    {items.map(([label,href,icon])=><Link key={href} href={href} className={path===href?"selected":""}><ProfessionalIcon name={icon} className="setup-nav-icon"/><span>{label}</span></Link>)}
    <Link href="/" className="preview-link"><ProfessionalIcon name="navigation" className="setup-nav-icon"/><span>View Portfolio</span></Link>
  </aside><main className="setup-main">
    <div className="setup-savebar" role="status" aria-live="polite">
      <div className={`draft-status ${statusClass}`}>
        <span className="draft-status-dot" aria-hidden="true" />
        <div>
          <strong>{statusTitle}</strong>
          <small>{statusText}</small>
        </div>
      </div>
      <div className="setup-save-actions">
        <button
          type="button"
          className="button secondary compact"
          disabled={!hydrated || publishing}
          onClick={() => {
            if (
              confirm(
                "Load the latest published content? This removes local edits. Export JSON first if you want a backup."
              )
            ) {
              if (cloud) void reloadLive(); else reset();
            }
          }}
          title="Clear this browser draft and load the data deployed from src/data/portfolio.json"
        >
          {cloud ? "Reload Live" : "Reload Deployed"}
        </button>
        <button
          type="button"
          className="button secondary compact"
          disabled={!hydrated || !dirty || publishing}
          onClick={() => {
            if (confirm("Discard all unsaved changes and return to the last saved draft?")) {
              discardChanges();
            }
          }}
        >
          Revert Unsaved
        </button>
        <button
          type="button"
          className="button compact"
          disabled={!hydrated || !dirty || publishing}
          onClick={saveDraft}
        >
          <ProfessionalIcon name="check" className="button-icon" />
          Save Draft
        </button>
        {cloud && <>
          <button type="button" className="button compact" disabled={!hydrated || publishing} onClick={() => void publish()}>{publishing ? "Publishing…" : "Save & Publish"}</button>
          <button type="button" className="button secondary compact" disabled={publishing} onClick={() => { void logout().catch(error => setLoginError(String(error))); }}>Sign out</button>
        </>}
      </div>
    </div>
    {(status || loginError) && <p className="notice" role="status">{status || loginError}</p>}
    {children}
  </main></div>;
}
