export function stripToPlainText(raw: string): string {
  return raw
    .replace(/\n:::::\n/g, " ")
    .replace(/\n---\n/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/#[\w-]+/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[\s\n]+/g, " ")
    .trim();
}
