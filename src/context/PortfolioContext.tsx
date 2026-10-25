"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import defaults from "@/data/portfolio.json";

import { isPortfolio } from "@/lib/portfolioValidation.mjs";

type BasePortfolioData = typeof defaults;

type PortfolioProject = BasePortfolioData["projects"][number] & {
  startDate?: string;
  endDate?: string;
};

export type Recommendation = {
  id: string;
  name: string;
  headline: string;
  relationship: string;
  date: string;
  text: string;
  source?: string;
  image?: string;
};

export type PortfolioData = Omit<BasePortfolioData, "projects" | "recommendations"> & {
  projects: PortfolioProject[];
  recommendations: Recommendation[];
};

type ContextType = {
  data: PortfolioData;
  hydrated: boolean;
  dirty: boolean;
  hasSavedDraft: boolean;
  lastSavedAt: string | null;
  update: (recipe: (draft: PortfolioData) => void) => void;
  replace: (data: PortfolioData) => void;
  saveDraft: () => void;
  cloud: boolean;
  authenticated: boolean;
  publishing: boolean;
  status: string;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  publish: () => Promise<void>;
  reloadLive: () => Promise<void>;
  discardChanges: () => void;
  reset: () => void;
};

const STORAGE_KEY = "khr-portfolio-draft-v1";
const SAVED_AT_KEY = `${STORAGE_KEY}-saved-at`;
const CLOUD_DRAFT_KEY = "khr-cloud-draft-v1";
const cloud = process.env.NEXT_PUBLIC_CLOUD_CMS === "true";
const PortfolioContext = createContext<ContextType | null>(null);

function normalizePortfolio(input: unknown): PortfolioData {
  if (!isPortfolio(input)) throw new Error("Invalid portfolio JSON: required fields are missing or have invalid types.");
  return structuredClone(input) as PortfolioData;
}
const normalizedDefaults = normalizePortfolio(defaults);

async function api(path: string, method = "GET", payload?: unknown) {
  const response = await fetch(`/api/${path}`, {
    method, cache: "no-store", credentials: "same-origin",
    headers: payload === undefined ? {} : { "Content-Type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed. Please try again.");
  return result;
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSetupRoute = /(^|\/)setup(\/|$)/.test(pathname);
  const [data, setData] = useState<PortfolioData>(normalizedDefaults);
  const [hydrated, setHydrated] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(normalizedDefaults));
  const [publishedSnapshot, setPublishedSnapshot] = useState(() => JSON.stringify(normalizedDefaults));
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState("");
  const revision = useRef(0);
  const draft = useRef<PortfolioData | null>(null);
  const published = useRef<PortfolioData>(normalizedDefaults);
  const initialized = useRef(false);
  const route = useRef(isSetupRoute);
  route.current = isSetupRoute;
  const snapshot = useMemo(() => JSON.stringify(data), [data]);
  const dirty = hydrated && snapshot !== (cloud ? publishedSnapshot : savedSnapshot);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setHydrated(false);
      try {
        if (cloud) {
          const result = await api("portfolio");
          if (cancelled) return;
          const live = result.data ? normalizePortfolio(result.data) : normalizedDefaults;
          const hadLocalEdits = draft.current !== null && JSON.stringify(draft.current) !== JSON.stringify(published.current);
          published.current = live;
          setPublishedSnapshot(JSON.stringify(live));
          if (!initialized.current) {
            revision.current = result.revision;
            try {
              const stored = JSON.parse(localStorage.getItem(CLOUD_DRAFT_KEY) || "null");
              if (stored && stored.revision !== undefined) {
                draft.current = normalizePortfolio(stored.data);
                revision.current = stored.revision;
                setHasSavedDraft(true);
                setLastSavedAt(stored.savedAt);
              }
            } catch { /* A corrupt backup must not stop live content loading. */ }
            initialized.current = true;
          } else if (!hadLocalEdits) {
            revision.current = result.revision;
            draft.current = live;
          }
          if (draft.current && JSON.stringify(draft.current) === JSON.stringify(live)) revision.current = result.revision;
          setData(isSetupRoute && draft.current ? draft.current : live);
          if (isSetupRoute) {
            const session = await api("session");
            if (!cancelled) setAuthenticated(session.authenticated);
          }
        } else {
          if (isSetupRoute && !draft.current) {
            try {
              const stored = localStorage.getItem(STORAGE_KEY);
              if (stored) {
                draft.current = normalizePortfolio(JSON.parse(stored));
                setSavedSnapshot(JSON.stringify(draft.current));
                setHasSavedDraft(true);
                setLastSavedAt(localStorage.getItem(SAVED_AT_KEY));
              }
            } catch { /* Fall back to repository defaults. */ }
          }
          setData(isSetupRoute && draft.current ? draft.current : normalizedDefaults);
        }
      } catch (error) {
        if (!cancelled) setStatus(error instanceof Error ? error.message : "Could not load live content.");
      } finally { if (!cancelled) setHydrated(true); }
    }
    void load();
    return () => { cancelled = true; };
  }, [isSetupRoute]);

  useEffect(() => {
    if (!dirty || !isSetupRoute) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, isSetupRoute]);

  // Visitors with an open page receive new content on focus or within one minute.
  useEffect(() => {
    if (!cloud || isSetupRoute) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const result = await api("portfolio");
        if (cancelled || route.current) return;
        const live = result.data ? normalizePortfolio(result.data) : normalizedDefaults;
        published.current = live;
        setPublishedSnapshot(JSON.stringify(live));
        setData(live);
      } catch { /* Keep the last successfully loaded public content. */ }
    };
    const focus = () => { if (document.visibilityState === "visible") void refresh(); };
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 60000);
    document.addEventListener("visibilitychange", focus);
    return () => { cancelled = true; window.clearInterval(timer); document.removeEventListener("visibilitychange", focus); };
  }, [isSetupRoute]);

  function saveDraft() {
    try {
      const savedAt = new Date().toISOString();
      if (cloud) localStorage.setItem(CLOUD_DRAFT_KEY, JSON.stringify({ data, revision: revision.current, savedAt }));
      else { localStorage.setItem(STORAGE_KEY, snapshot); localStorage.setItem(SAVED_AT_KEY, savedAt); }
      setSavedSnapshot(snapshot); setHasSavedDraft(true); setLastSavedAt(savedAt);
      setStatus("Draft backed up in this browser.");
    } catch { setStatus("Browser storage is unavailable or full. Export JSON to back up your edits."); }
  }

  async function reloadLive() {
    try {
      if (cloud) {
        const result = await api("portfolio");
        const live = result.data ? normalizePortfolio(result.data) : normalizedDefaults;
        revision.current = result.revision; published.current = live; draft.current = live;
        setData(live); setPublishedSnapshot(JSON.stringify(live)); setSavedSnapshot(JSON.stringify(live));
        localStorage.removeItem(CLOUD_DRAFT_KEY);
      } else {
        draft.current = normalizedDefaults; setData(normalizedDefaults);
        setSavedSnapshot(JSON.stringify(normalizedDefaults));
        localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(SAVED_AT_KEY);
      }
      setHasSavedDraft(false); setLastSavedAt(null); setStatus("Latest published content loaded.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Could not reload content."); }
  }

  async function publish() {
    setPublishing(true); setStatus("");
    try {
      const content = normalizePortfolio(data);
      const result = await api("portfolio", "PUT", { data: content, revision: revision.current });
      revision.current = result.revision; published.current = content;
      setPublishedSnapshot(JSON.stringify(content)); setSavedSnapshot(JSON.stringify(content));
      setLastSavedAt(result.updatedAt); setHasSavedDraft(false);
      // Publishing succeeded even if clearing an old browser backup fails.
      try { localStorage.removeItem(CLOUD_DRAFT_KEY); } catch { /* optional backup */ }
      setStatus("Published. Your live portfolio is updated.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Publishing failed. Your edits remain in the editor.");
    } finally { setPublishing(false); }
  }

  const value: ContextType = {
    data, hydrated, dirty, hasSavedDraft, lastSavedAt, cloud, authenticated, publishing, status,
    update: recipe => setData(current => { const copy = structuredClone(current); recipe(copy); draft.current = copy; return copy; }),
    replace: next => { const content = normalizePortfolio(next); draft.current = content; setData(content); },
    saveDraft, publish, reloadLive,
    login: async password => { const result = await api("login", "POST", { password }); setAuthenticated(result.authenticated); },
    logout: async () => { await api("logout", "POST", {}); setAuthenticated(false); },
    discardChanges: () => { const content = cloud ? published.current : normalizePortfolio(JSON.parse(savedSnapshot)); draft.current = content; setData(content); },
    reset: () => { void reloadLive(); },
  };
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return ctx;
}
