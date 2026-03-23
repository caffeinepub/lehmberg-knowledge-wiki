import { Skeleton } from "@/components/ui/skeleton";
import { useBannerUrl } from "@/hooks/useBannerUrl";
import { useListPages } from "@/hooks/useQueries";
import { toRichPreviewHtml } from "@/lib/richPreview";
import { titleToSlug } from "@/lib/slug";
import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import { motion } from "motion/react";

const SECTION_DELIMITER = "\n---\n";
const NAME_BODY_DELIMITER = "\n:::::\n";

const previewTagStyle: React.CSSProperties = {
  fontFamily: "var(--wp-tags-font)",
  fontSize: "var(--wp-tags-size)" as any,
  fontWeight: "var(--wp-tags-weight)" as any,
  fontStyle: "var(--wp-tags-style)" as any,
  textDecoration: "var(--wp-tags-deco)" as any,
};

function parseSectionString(raw: string): { name: string; text: string } {
  const delimIdx = raw.indexOf(NAME_BODY_DELIMITER);
  if (delimIdx !== -1) {
    return {
      name: raw.slice(0, delimIdx),
      text: raw.slice(delimIdx + NAME_BODY_DELIMITER.length),
    };
  }
  return { name: "", text: raw };
}

function truncateBodyHtml(raw: string, maxChars: number): string {
  let visibleCount = 0;
  let inTag = false;
  let i = 0;

  while (i < raw.length) {
    if (raw[i] === "<") {
      inTag = true;
      i++;
      continue;
    }
    if (raw[i] === ">") {
      inTag = false;
      i++;
      continue;
    }
    if (!inTag) {
      visibleCount++;
      if (visibleCount >= maxChars) {
        // Trim back to last word boundary
        let cutPoint = i + 1;
        while (
          cutPoint > 0 &&
          raw[cutPoint - 1] !== " " &&
          raw[cutPoint - 1] !== "\n"
        ) {
          cutPoint--;
        }
        if (cutPoint <= 0) cutPoint = i + 1;
        return `${raw.slice(0, cutPoint).trimEnd()}\u2026`;
      }
    }
    i++;
  }

  return raw;
}

export function IndexPage() {
  const { data: pages, isLoading, isError } = useListPages();
  const [bannerUrl] = useBannerUrl();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 page-enter">
      <div className="mb-10 overflow-hidden rounded-lg">
        <img
          src={bannerUrl}
          alt="Lehmberg farmstead landscape"
          className="w-full h-32 sm:h-48 object-cover"
        />
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-4xl sm:text-5xl text-foreground mb-3">
          All Entries
        </h1>
        <p className="text-muted-foreground font-body text-lg italic">
          A growing collection of knowledge for the Lehmberg farmstead.
        </p>
      </div>

      {isLoading && (
        <div
          className="grid gap-4 sm:grid-cols-2"
          data-ocid="pages.loading_state"
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 border border-border rounded-lg bg-card"
            >
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (isError || (pages && pages.length === 0)) && (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="pages.empty_state"
        >
          <Sprout className="w-10 h-10 mx-auto mb-4 opacity-40" />
          <p className="font-body text-lg italic">No pages exist yet.</p>
        </div>
      )}

      {!isLoading && !isError && pages && pages.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2" data-ocid="pages.list">
          {pages.map((page, index) => {
            const sections = page.body
              .split(SECTION_DELIMITER)
              .map(parseSectionString);
            return (
              <motion.div
                key={page.id.toString()}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.25 }}
                data-ocid={`pages.item.${index + 1}`}
              >
                <Link
                  to="/page/$slug"
                  params={{ slug: titleToSlug(page.title) }}
                  className="block p-5 border border-border rounded-lg bg-card hover:border-primary/50 hover:shadow-parchment transition-all duration-200 group"
                >
                  <h2
                    className="wiki-preview-title text-foreground group-hover:text-primary transition-colors"
                    style={{ marginBottom: "var(--wp-title-section-gap)" }}
                  >
                    {page.title}
                  </h2>
                  {page.body && (
                    <div className="text-muted-foreground mb-3">
                      {sections.map((sec, si) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: preview list
                        <span key={si}>
                          {sec.name && (
                            <span
                              className="wiki-preview-section block"
                              style={{
                                marginBottom: "var(--wp-section-body-gap)",
                              }}
                            >
                              {sec.name}
                            </span>
                          )}
                          <span
                            className="wiki-preview-body block"
                            // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitised preview html
                            dangerouslySetInnerHTML={{
                              __html: toRichPreviewHtml(
                                truncateBodyHtml(sec.text, 200),
                              ),
                            }}
                          />
                        </span>
                      ))}
                    </div>
                  )}
                  {page.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {page.tags.map((tag) => (
                        <span
                          key={tag}
                          className="tag-badge"
                          style={{ ...previewTagStyle, pointerEvents: "none" }}
                        >
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </main>
  );
}
