export type ProjectDateFields = {
  id: string;
  startDate?: string;
  endDate?: string;
};

function parseMonth(value?: string) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || month < 1 || month > 12) return null;
  return Date.UTC(year, month - 1, 1);
}

function setupTimestamp(id: string) {
  const match = /^project-(\d+)$/.exec(id);
  return match ? Number(match[1]) : null;
}

export function formatProjectMonth(value?: string) {
  const stamp = parseMonth(value);
  if (stamp === null) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(stamp));
}

export function formatProjectPeriod(project: ProjectDateFields) {
  const start = formatProjectMonth(project.startDate);
  const end = project.endDate ? formatProjectMonth(project.endDate) : project.startDate ? "Present" : "";
  if (start && end) return `${start} — ${end}`;
  return start || end || "";
}

export function sortProjectsRecentFirst<T extends ProjectDateFields>(projects: T[]) {
  return projects
    .map((project, index) => ({ project, index }))
    .sort((a, b) => {
      const aHasDate = Boolean(a.project.startDate || a.project.endDate);
      const bHasDate = Boolean(b.project.startDate || b.project.endDate);

      if (aHasDate !== bHasDate) return aHasDate ? -1 : 1;

      if (aHasDate && bHasDate) {
        const aEnd = a.project.endDate ? parseMonth(a.project.endDate) ?? 0 : Number.MAX_SAFE_INTEGER;
        const bEnd = b.project.endDate ? parseMonth(b.project.endDate) ?? 0 : Number.MAX_SAFE_INTEGER;
        if (aEnd !== bEnd) return bEnd - aEnd;

        const aStart = parseMonth(a.project.startDate) ?? 0;
        const bStart = parseMonth(b.project.startDate) ?? 0;
        if (aStart !== bStart) return bStart - aStart;
      }

      const aSetup = setupTimestamp(a.project.id);
      const bSetup = setupTimestamp(b.project.id);
      if (aSetup !== null && bSetup !== null) return bSetup - aSetup;
      if (aSetup !== null) return -1;
      if (bSetup !== null) return 1;

      return a.index - b.index;
    })
    .map(({ project }) => project);
}
