import { TagBadge } from "@/components/TagBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPagesByTag } from "@/hooks/useQueries";
import { titleToSlug } from "@/lib/slug";
import { stripToPlainText } from "@/lib/stripToPlainText";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Tag } from "lucide-react";
import { motion } from "motion/react";

export function TagIndexPage() {
  const { tag } = useParams({ from: "/tag/$tag" });
  const navigate = useNavigate();
  const tagWithHash = tag.startsWith("#") ? tag : `#${tag}`;

  const { data: pages, isLoading, isError } = useGetPagesByTag(tagWithHash);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 page-enter">
      <button
        type="button"
        onClick={() => navigate({ to: "/" })}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-body mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> All entries
      </button>

      <div className="mb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-accent/60 border border-border flex items-center justify-center">
          <Tag className="w-4 h-4 text-accent-foreground" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-foreground">
          {tagWithHash}
        </h1>
      </div>

      {isLoading && (
        <div
          className="grid gap-4 sm:grid-cols-2"
          data-ocid="pages.loading_state"
        >
          {[1, 2, 3].map((i) => (
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

      {isError && (
        <div
          className="p-5 border border-destructive/30 rounded-lg bg-destructive/5 text-destructive"
          data-ocid="pages.error_state"
        >
          <p className="font-body">Failed to load pages for this tag.</p>
        </div>
      )}

      {!isLoading && !isError && pages && pages.length === 0 && (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="pages.empty_state"
        >
          <Tag className="w-10 h-10 mx-auto mb-4 opacity-40" />
          <p className="font-body text-lg italic">
            No pages found with this tag.
          </p>
        </div>
      )}

      {!isLoading && !isError && pages && pages.length > 0 && (
        <>
          <p className="text-muted-foreground font-body mb-5 italic">
            {pages.length} {pages.length === 1 ? "entry" : "entries"} tagged{" "}
            <TagBadge tag={tagWithHash} />
          </p>
          <div className="grid gap-4 sm:grid-cols-2" data-ocid="pages.list">
            {pages.map((page, index) => (
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
                  <h2 className="wiki-preview-title text-foreground group-hover:text-primary transition-colors mb-2">
                    {page.title}
                  </h2>
                  {page.body && (
                    <p className="wiki-preview-body text-muted-foreground line-clamp-2 mb-3">
                      {stripToPlainText(page.body)}
                    </p>
                  )}
                  {page.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {page.tags.map((t) => (
                        <span
                          key={t}
                          className="tag-badge"
                          style={{ pointerEvents: "none" }}
                        >
                          {t.startsWith("#") ? t : `#${t}`}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
