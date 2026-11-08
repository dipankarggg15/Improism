export type ContentStatus = "draft" | "published" | "archived";

export function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

export function validateTitle(value: string) {
  if (value.length < 3 || value.length > 200) {
    return "Title must be between 3 and 200 characters.";
  }
}

export function validateSubject(value: string) {
  if (!/^[0-9a-f-]{36}$/i.test(value)) return "Choose a subject.";
}

export function sanitizeRichText(input: string) {
  const withoutUnsafeBlocks = input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  const allowed = new Set([
    "p", "br", "strong", "b", "em", "i", "u", "h2", "h3",
    "ul", "ol", "li", "blockquote", "a",
  ]);

  return withoutUnsafeBlocks.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (tag, rawName, attrs) => {
    const name = String(rawName).toLowerCase();
    if (!allowed.has(name)) return "";
    if (tag.startsWith("</")) return `</${name}>`;
    if (name === "br") return "<br>";
    if (name === "a") {
      const match = String(attrs).match(/href\s*=\s*["']([^"']+)["']/i);
      const href = match?.[1] ?? "";
      if (/^(https?:\/\/|\/)/i.test(href)) {
        const escaped = href.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
        return `<a href="${escaped}" rel="noopener noreferrer">`;
      }
      return "<a>";
    }
    return `<${name}>`;
  }).trim();
}

export function readingMinutes(value: string) {
  const words = value.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.min(240, Math.ceil(words / 220)));
}
