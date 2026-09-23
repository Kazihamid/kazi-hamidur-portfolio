"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import defaults from "@/data/portfolio.json";

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

export type PortfolioData = Omit<BasePortfolioData, "projects"> & {
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
  discardChanges: () => void;
  reset: () => void;
};

const STORAGE_KEY = "khr-portfolio-draft-v1";
const SAVED_AT_KEY = "khr-portfolio-draft-v1-saved-at";
const PortfolioContext = createContext<ContextType | null>(null);

const SEEDED_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "pierre-corriveau-2017",
    name: "Pierre Corriveau",
    headline: "Senior Director at 2020",
    relationship: "Pierre worked with Kazi Hamidur on the same team",
    date: "2017-03-04",
    text: "Hamid was a valued member of our QA team and I recommend him highly to anybody organization.",
    source: "LinkedIn",
    image: "/images/recommendations/pierre-corriveau.png",
  },
  {
    id: "don-van-duren-2014",
    name: "Don Van Duren",
    headline: "Software Quality Assurance Manager - Retired :-)",
    relationship: "Don managed Kazi Hamidur directly",
    date: "2014-04-29",
    text: "Hamidur is and has been an important associate in our organization as we have and continue to grow our globally integrated software QA systems and performance.",
    source: "LinkedIn",
    image: "/images/recommendations/don-van-duren.png",
  },
];

function normalizePortfolio(input: BasePortfolioData | PortfolioData): PortfolioData {
  const parsed = structuredClone(input) as PortfolioData;

  // Preserve existing drafts, but migrate the original GitHub avatar to
  // the local professional portrait shipped with the portfolio.
  if (parsed.profile?.image === "https://github.com/Kazihamid.png?size=480") {
    parsed.profile.image = defaults.profile.image;
  }

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

        if (item === "Selenium + Java") return "Selenium-Java";
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

  parsed.projects = (parsed.projects ?? []).map((project) => ({
    ...project,
    startDate: project.startDate ?? "",
    endDate: project.endDate ?? "",
  }));

  parsed.projects.forEach((project) => {
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

  if (!Array.isArray(parsed.recommendations)) {
    parsed.recommendations = structuredClone(SEEDED_RECOMMENDATIONS);
  }

  // Enrich the original LinkedIn recommendations with the supplied profile
  // images even when an older saved draft/repository JSON does not yet
  // contain the new image field.
  parsed.recommendations.forEach((item) => {
    if (!item.image && item.name === "Pierre Corriveau") {
      item.image = "/images/recommendations/pierre-corriveau.png";
    }
    if (!item.image && item.name === "Don Van Duren") {
      item.image = "/images/recommendations/don-van-duren.png";
    }
  });

  if (!parsed.navigation.some((item) => item.href === "/recommendations")) {
    const recommendationNav = {
      label: "Recommendations",
      href: "/recommendations",
      visible: true,
    };
    const contactIndex = parsed.navigation.findIndex((item) => item.href === "/contact");
    if (contactIndex >= 0) parsed.navigation.splice(contactIndex, 0, recommendationNav);
    else parsed.navigation.push(recommendationNav);
  }

  return parsed;
}

const normalizedDefaults = normalizePortfolio(defaults);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSetupRoute = /(^|\/)setup(\/|$)/.test(pathname);
  const [data, setData] = useState<PortfolioData>(normalizedDefaults);
  const [hydrated, setHydrated] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(normalizedDefaults));
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    // Public pages always render deployed repository data. Browser drafts belong
    // only to /setup so visitors never see stale localStorage content.
    if (!isSetupRoute) {
      const deployed = normalizePortfolio(defaults);
      setData(deployed);
      setSavedSnapshot(JSON.stringify(deployed));
      setHasSavedDraft(false);
      setLastSavedAt(null);
      setHydrated(true);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const savedAt = localStorage.getItem(SAVED_AT_KEY);

      if (stored) {
        const parsed = normalizePortfolio(JSON.parse(stored) as PortfolioData);
        setData(parsed);
        setSavedSnapshot(JSON.stringify(parsed));
        setHasSavedDraft(true);
        setLastSavedAt(savedAt);
      } else {
        const deployed = normalizePortfolio(defaults);
        setData(deployed);
        setSavedSnapshot(JSON.stringify(deployed));
        setHasSavedDraft(false);
        setLastSavedAt(null);
      }
    } catch {
      const deployed = normalizePortfolio(defaults);
      setData(deployed);
      setSavedSnapshot(JSON.stringify(deployed));
      setHasSavedDraft(false);
      setLastSavedAt(null);
    } finally {
      setHydrated(true);
    }
  }, [isSetupRoute]);

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
    replace: (nextData) => setData(normalizePortfolio(structuredClone(nextData))),
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
        setData(normalizePortfolio(JSON.parse(savedSnapshot) as PortfolioData));
      } catch {
        setData(normalizePortfolio(defaults));
      }
    },
    reset: () => {
      const deployed = normalizePortfolio(defaults);
      setData(deployed);
      setSavedSnapshot(JSON.stringify(deployed));
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
