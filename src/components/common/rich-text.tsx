/** Renders instructor-authored rich text (course description, etc.) that the
 *  backend stores as HTML. Centralizes the one dangerouslySetInnerHTML call
 *  so every screen renders it the same way instead of re-inlining it. */
export function RichText({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  if (!html) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
