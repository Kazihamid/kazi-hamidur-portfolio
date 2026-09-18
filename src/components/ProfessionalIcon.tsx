import type { ReactNode } from "react";

export type IconName =
  | "experience"
  | "leadership"
  | "enterprise"
  | "automation"
  | "project"
  | "api"
  | "performance"
  | "database"
  | "quality"
  | "strategy"
  | "risk"
  | "shift"
  | "improvement"
  | "requirement"
  | "validation"
  | "release"
  | "collaboration"
  | "report"
  | "mentor"
  | "review"
  | "knowledge"
  | "career"
  | "certificate"
  | "education"
  | "email"
  | "location"
  | "linkedin"
  | "github"
  | "send"
  | "health"
  | "skills"
  | "settings"
  | "home"
  | "navigation"
  | "import"
  | "profile"
  | "code"
  | "shield"
  | "check"
  | "quote"
  | "download";

const paths: Record<IconName, ReactNode> = {
  experience: <><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/><path d="M5 4 3.5 5.5M19 4l1.5 1.5"/></>,
  leadership: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3.5 19c.7-3.5 2.8-5.2 5.5-5.2s4.8 1.7 5.5 5.2"/><path d="M14.5 15.2c2.9-.5 5 .8 6 3.8"/></>,
  enterprise: <><path d="M4 20V6l8-3 8 3v14"/><path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2"/><path d="M2 20h20"/></>,
  automation: <><path d="M8 5 3 12l5 7M16 5l5 7-5 7"/><path d="m14 4-4 16"/></>,
  project: <><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M8 5V3h8v2M3 10h18"/><path d="M10 14h4"/></>,
  api: <><circle cx="5" cy="12" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 11l10-4M7 13l10 4"/></>,
  performance: <><path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 12l4-4"/><path d="M7 17h10"/></>,
  database: <><ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5"/><path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></>,
  quality: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4V2M20 12h2M12 20v2M4 12H2"/></>,
  strategy: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/><path d="m3 8 6-5 6 8 6-6"/></>,
  risk: <><path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.8 7.5 9.5 4.4-1.7 7.5-4.8 7.5-9.5V6L12 3Z"/><path d="M12 8v5"/><circle cx="12" cy="16.5" r=".8" fill="currentColor" stroke="none"/></>,
  shift: <><path d="M20 7H9"/><path d="m12 4-3 3 3 3"/><path d="M18 17H7"/><path d="m10 14-3 3 3 3"/><path d="m14.5 15 1.7 1.7 3.3-3.7"/></>,
  improvement: <><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/><path d="m8 14 2.5-2.5 2 2L16 10"/></>,
  requirement: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
  validation: <><path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.8 7.5 9.5 4.4-1.7 7.5-4.8 7.5-9.5V6L12 3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
  release: <><path d="M14 4c3 1 5 3 6 6l-5 5-5-5 4-6Z"/><path d="m10 10-5 2-2 4 5-1"/><path d="m15 15-2 5 4-2 2-5"/></>,
  collaboration: <><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 19c.8-3.8 2.8-5.5 5.5-5.5 2.6 0 4.7 1.7 5.5 5.5"/><path d="M14 15c2.8-.7 5.4.7 7 4"/></>,
  report: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 16v-3M12 16V9M16 16v-6"/></>,
  mentor: <><circle cx="8" cy="8" r="3"/><path d="M2.5 19c.8-3.7 2.8-5.3 5.5-5.3s4.7 1.6 5.5 5.3"/><path d="M16 7h5M18.5 4.5V9.5"/></>,
  review: <><path d="M5 4h11l3 3v13H5z"/><path d="M15 4v4h4"/><path d="m8 14 2 2 5-5"/></>,
  knowledge: <><path d="M4 5.5C6.5 4 9 4 12 6v13c-3-2-5.5-2-8-.5z"/><path d="M20 5.5C17.5 4 15 4 12 6v13c3-2 5.5-2 8-.5z"/></>,
  career: <><path d="M4 19h16"/><path d="M6 16V8h4v8M14 16V4h4v12"/><path d="m5 7 4-4 4 3 6-5"/></>,
  certificate: <><rect x="5" y="3" width="14" height="13" rx="2"/><path d="m9 20 3-4 3 4"/><path d="M8 8h8M8 11h5"/></>,
  education: <><path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3.5 2.7 8.5 2.7 12 0v-5"/><path d="M22 9v6"/></>,
  email: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
  location: <><path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></>,
  linkedin: <><rect x="4" y="9" width="3" height="10"/><circle cx="5.5" cy="5.5" r="1.5"/><path d="M11 19V9h3v1.7c1-1.3 2.2-2 3.8-2 2.6 0 3.2 1.9 3.2 4.7V19h-3v-5c0-1.5-.3-2.5-1.7-2.5-1.6 0-2.3 1.1-2.3 3.1V19z"/></>,
  github: <><path d="M12 3a9 9 0 0 0-2.8 17.5c.5.1.7-.2.7-.5v-2c-2.9.6-3.5-1.2-3.5-1.2-.5-1.2-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.3-.3-4.7-1.1-4.7-5A3.9 3.9 0 0 1 7.2 8c-.1-.3-.5-1.3.1-2.7 0 0 .8-.3 2.8 1A9.5 9.5 0 0 1 12 6c.9 0 1.8.1 2.6.4 2-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.7 5 .4.3.7 1 .7 2V20c0 .3.2.6.7.5A9 9 0 0 0 12 3Z"/></>,
  send: <><path d="m3 11 18-8-8 18-2-7z"/><path d="m11 14 10-11"/></>,
  health: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
  skills: <><path d="M4 7h10M4 12h16M4 17h8"/><circle cx="18" cy="7" r="2"/><circle cx="15" cy="17" r="2"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19 13.5a7.8 7.8 0 0 0 0-3l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2.6-1.5L13.7 2h-4L9.4 5a8 8 0 0 0-2.6 1.5l-2.4-1-2 3.5 2 1.5a7.8 7.8 0 0 0 0 3l-2 1.5 2 3.5 2.4-1A8 8 0 0 0 9.4 19l.3 3h4l.3-3a8 8 0 0 0 2.6-1.5l2.4 1 2-3.5z"/></>,
  home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
  navigation: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></>,
  import: <><path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M4 17v3h16v-3"/></>,
  profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.5 3.6-7 8-7s7.2 2.5 8 7"/></>,
  code: <><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/></>,
  shield: <><path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.8 7.5 9.5 4.4-1.7 7.5-4.8 7.5-9.5V6L12 3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
  check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
  quote: <><path d="M6 8h5v5H8c0 2-1 3-3 4"/><path d="M14 8h5v5h-3c0 2-1 3-3 4"/></>,
  download: <><path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M4 19h16"/></>,
};

export function ProfessionalIcon({
  name,
  className = "",
  title,
}: {
  name: IconName;
  className?: string;
  title?: string;
}) {
  return (
    <span className={`professional-icon ${className}`.trim()} title={title} aria-hidden={title ? undefined : true}>
      <svg viewBox="0 0 24 24" fill="none" role={title ? "img" : undefined} aria-label={title}>
        {paths[name]}
      </svg>
    </span>
  );
}
