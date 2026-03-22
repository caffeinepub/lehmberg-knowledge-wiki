/** Convert a page title to a URL slug: umlauts expanded, spaces → underscores */
export function titleToSlug(title: string): string {
  return title
    .replace(/Ä/g, "Ae")
    .replace(/Ö/g, "Oe")
    .replace(/Ü/g, "Ue")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/ /g, "_");
}

/** Convert a URL slug back to a page title: underscores → spaces */
export function slugToTitle(slug: string): string {
  return slug.replace(/_/g, " ");
}
