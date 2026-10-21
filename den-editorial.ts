/** Reject rather than silently rewriting an editor's prose. */
export function validateDenOriginalText(sourceName: unknown, fields: Record<string, unknown>): void {
  if (typeof sourceName !== "string" || sourceName.trim().toLowerCase() !== "the innovators den") return;
  const invalid = ["title", "subtitle", "summary", "content", "videoCaption"]
    .filter(field => typeof fields[field] === "string" && /\u2014/.test(fields[field] as string));
  if (invalid.length) {
    throw new Error(
      `Den originals cannot contain em dashes. Replace them with suitable punctuation in: ${invalid.join(", ")}.`,
    );
  }
}
