"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import defaults from "@/data/portfolio.json";

export type PortfolioData = typeof defaults;
type ContextType = {
  data: PortfolioData;
  hydrated: boolean;
  update: (recipe: (draft: PortfolioData) => void) => void;
  replace: (data: PortfolioData) => void;
  reset: () => void;
};

const STORAGE_KEY = "khr-portfolio-draft-v1";
const PortfolioContext = createContext<ContextType | null>(null);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PortfolioData>(defaults);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PortfolioData;
        // Preserve existing drafts, but migrate the original GitHub avatar to
        // the new local professional portrait shipped with the portfolio.
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
            item.detail = "Python-Playwright · Selenium-Java";
          }
        });
        parsed.skills?.forEach((group) => {
          if (group.group === "Automation") {
            group.items = group.items.map((item) =>
              item === "Playwright + Python" ? "Python + Playwright" : item
            );
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
            project.tools = ["Python", "Playwright", "Selenium", "Java"];
          }
        });

        setData(parsed);
      }
    } catch {
      // Keep defaults if local draft is invalid.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  const value = useMemo<ContextType>(() => ({
    data,
    hydrated,
    update: (recipe) => setData((current) => {
      const copy = structuredClone(current);
      recipe(copy);
      return copy;
    }),
    replace: setData,
    reset: () => {
      setData(defaults);
      localStorage.removeItem(STORAGE_KEY);
    },
  }), [data, hydrated]);

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return ctx;
}
