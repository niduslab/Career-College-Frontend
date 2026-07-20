import { config } from "@/lib/config";
export function mediaUrl(path: string | null): string | null {
  if (!path) return null;
  // Already absolute (backend URL) or a local object/data URL — pass through untouched.
  if (/^(https?|blob|data):/.test(path)) return path;
  const origin = config.apiBaseUrl.replace(/\/api\/v1\/?$/, "");
  return `${origin}${path}`;
}

/** ISO "yyyy-MM-dd" → local Date (local time avoids a UTC off-by-one). */
export function isoToDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/** Local Date → ISO "yyyy-MM-dd". */
export function dateToIso(date: Date | undefined): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Two-letter initials from a full name (fallback avatar). */
export function initialsOf(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]!.toUpperCase();
  return (parts[0][0]! + parts[parts.length - 1][0]!).toUpperCase();
}
