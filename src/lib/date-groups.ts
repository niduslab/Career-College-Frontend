/** "Today" / "Yesterday" / full date label for a message timestamp, WhatsApp-style day separators. */
export function dayLabel(iso: string): string {
  const created = new Date(iso);
  const now = new Date();
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round(
    (startOf(now) - startOf(created)) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return created.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: created.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
