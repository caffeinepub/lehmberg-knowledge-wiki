/**
 * Converts raw wiki HTML body into a truncated rich preview.
 * Preserves: bold, italic, underline, bullet/numbered lists, section names.
 * Section names are rendered as block-level <h3> headings on their own line.
 * Strips: [[wiki links]] (keeps inner text), #tags, all other HTML tags,
 *         section dividers (--- ), and HTML entities → plain chars.
 */

const SECTION_DELIMITER = "\n---\n";
const NAME_BODY_DELIMITER = "\n:::::\n";

export function toRichPreviewHtml(raw: string): string {
  if (!raw) return "";

  // Split into sections and process each
  const sections = raw.split(SECTION_DELIMITER);

  const processedSections = sections.map((section) => {
    const delimIdx = section.indexOf(NAME_BODY_DELIMITER);
    let sectionName = "";
    let bodyPart = section;

    if (delimIdx !== -1) {
      sectionName = section.slice(0, delimIdx).trim();
      bodyPart = section.slice(delimIdx + NAME_BODY_DELIMITER.length);
    }

    // Process the body part
    let body = bodyPart
      // Wiki link brackets [[Title]] → Title
      .replace(/\[\[([^\]]+)\]\]/g, "$1")
      // Hash tags
      .replace(/#[\w-]+/g, "")
      // HTML entities
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"');

    // Strip all tags EXCEPT the ones we want to keep.
    body = body.replace(
      /<\/?([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*)?>/g,
      (match, tag) => {
        const allowed = ["strong", "em", "u", "b", "i", "ul", "ol", "li", "br"];
        if (allowed.includes(tag.toLowerCase())) return match;
        return " ";
      },
    );

    // Collapse excessive whitespace
    body = body
      .replace(/[ \t]+/g, " ")
      .replace(/(\s*<br\s*\/?>(\s*<br\s*\/?>)+)/gi, "<br>")
      .trim();

    if (sectionName) {
      return `<h3 class="preview-section-name">${sectionName}</h3><div class="preview-section-body">${body}</div>`;
    }
    return body;
  });

  return processedSections.filter(Boolean).join(" ").trim();
}
