export function assetPath(path: string) {
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}
