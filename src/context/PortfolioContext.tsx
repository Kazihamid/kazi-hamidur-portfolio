"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import defaults from "@/data/portfolio.json";

export type PortfolioData = typeof defaults;
type ContextType = {
  data: PortfolioData;
  hydrated: boolean;
  dirty: boolean;
  hasSavedDraft: boolean;
  lastSavedAt: string | null;
  update: (recipe: (draft: PortfolioData) => void) => void;
  replace: (data: PortfolioData) => void;
  saveDraft: () => void;
  discardChanges: () => void;
  reset: () => void;
};

const STORAGE_KEY = "khr-portfolio-draft-v1";
const SAVED_AT_KEY = "khr-portfolio-draft-v1-saved-at";
const PortfolioContext = createContext<ContextType | null>(null);

function migrateDraft(parsed: PortfolioData) {
  // Preserve existing drafts, but migrate the original GitHub avatar to
  // the local professional portrait shipped with the portfolio.
  if (parsed.profile?.image === "https://github.com/Kazihamid.png?size=480") {
    parsed.profile.image = defaults.profile.image;
  }

  // Migrate content labels changed in the current portfolio design.
  parsed.highlights?.forEach((item) => {
    if (item.label === "AUTO") item.label = "TEST";

    if (item.title === "Enterprise Quality") {
      item.detail = "HRMS · E-Recruitment · Payroll · ePMS";
    }

    if (item.title === "Automation") {
      item.detail = "Playwright-Python · Selenium-Java";
    }
  });

  parsed.skills?.forEach((group) => {
    if (group.group === "Automation") {
      group.items = group.items.map((item) => {
        if (
          item === "Python + Playwright" ||
          item === "Playwright + Python" ||
          item === "Python-Playwright"
        ) {
          return "Playwright-Python";
        }

        if (item === "Selenium + Java") {
          return "Selenium-Java";
        }

        return item;
      });
    }
  });

  const technicalLead = parsed.experience?.find(
    (item) => item.role === "Technical Lead – Software Quality Assurance"
  );
  if (technicalLead && !technicalLead.focus.includes("AI-Driven Quality Engineering")) {
    technicalLead.focus.push("AI-Driven Quality Engineering");
  }

  parsed.projects?.forEach((project) => {
    if (project.id === "erp-hrms") {
      project.tools = project.tools.map((tool) =>
        tool === "ERP/HRMS" ? "AI-Driven Quality Engineering" : tool
      );
    }
    if (project.id === "erecruitment") {
      project.tools = project.tools.map((tool) =>
        tool === "UAT" ? "Integration Testing" : tool
      );
    }
    if (project.id === "automation") {
      project.description =
        "UI automation and regression coverage using Playwright-Python and Selenium-Java approaches.";
      project.tools = ["Playwright", "Python", "Selenium", "Java"];
    }
  });

  return parsed;
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PortfolioData>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(defaults));
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const savedAt = localStorage.getItem(SAVED_AT_KEY);

      if (stored) {
        const parsed = migrateDraft(JSON.parse(stored) as PortfolioData);
        setData(parsed);
        setSavedSnapshot(JSON.stringify(parsed));
        setHasSavedDraft(true);
        setLastSavedAt(savedAt);
      } else {
        setData(defaults);
        setSavedSnapshot(JSON.stringify(defaults));
        setHasSavedDraft(false);
        setLastSavedAt(null);
      }
    } catch {
      // Keep repository defaults if a browser draft is invalid.
      setData(defaults);
      setSavedSnapshot(JSON.stringify(defaults));
      setHasSavedDraft(false);
      setLastSavedAt(null);
    } finally {
      setHydrated(true);
    }
  }, []);

  const currentSnapshot = useMemo(() => JSON.stringify(data), [data]);
  const dirty = hydrated && currentSnapshot !== savedSnapshot;

  useEffect(() => {
    if (!dirty) return;

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [dirty]);

  const value = useMemo<ContextType>(() => ({
    data,
    hydrated,
    dirty,
    hasSavedDraft,
    lastSavedAt,
    update: (recipe) => setData((current) => {
      const copy = structuredClone(current);
      recipe(copy);
      return copy;
    }),
    replace: (nextData) => setData(migrateDraft(structuredClone(nextData))),
    saveDraft: () => {
      const serialized = JSON.stringify(data);
      const savedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, serialized);
      localStorage.setItem(SAVED_AT_KEY, savedAt);
      setSavedSnapshot(serialized);
      setHasSavedDraft(true);
      setLastSavedAt(savedAt);
    },
    discardChanges: () => {
      try {
        setData(JSON.parse(savedSnapshot) as PortfolioData);
      } catch {
        setData(defaults);
      }
    },
    reset: () => {
      setData(defaults);
      setSavedSnapshot(JSON.stringify(defaults));
      setHasSavedDraft(false);
      setLastSavedAt(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SAVED_AT_KEY);
    },
  }), [data, hydrated, dirty, hasSavedDraft, lastSavedAt, savedSnapshot]);

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return ctx;
}
