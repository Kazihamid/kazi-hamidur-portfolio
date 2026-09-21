"use client";

import { useEffect } from "react";

const CURRENT_VERSION = process.env.NEXT_PUBLIC_DEPLOY_VERSION || "local";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function DeploymentFreshness() {
  useEffect(() => {
    if (CURRENT_VERSION === "local") return;

    let cancelled = false;

    async function checkForNewDeployment() {
      try {
        const response = await fetch(
          `${BASE_PATH}/deployment-version.json?ts=${Date.now()}`,
          { cache: "no-store" }
        );
        if (!response.ok || cancelled) return;

        const payload = (await response.json()) as { version?: string };
        const latestVersion = payload.version;
        if (!latestVersion || cancelled) return;

        const url = new URL(window.location.href);

        if (latestVersion !== CURRENT_VERSION) {
          // A unique query value forces the browser/CDN to request the latest
          // exported page instead of reusing an old HTML document.
          if (url.searchParams.get("__deploy") !== latestVersion) {
            url.searchParams.set("__deploy", latestVersion);
            window.location.replace(url.toString());
          }
          return;
        }

        // Remove the temporary cache-busting query once the latest build loads.
        if (url.searchParams.has("__deploy")) {
          url.searchParams.delete("__deploy");
          window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
        }
      } catch {
        // Never interrupt the portfolio if the version check is unavailable.
      }
    }

    void checkForNewDeployment();

    const intervalId = window.setInterval(checkForNewDeployment, 5 * 60 * 1000);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void checkForNewDeployment();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
