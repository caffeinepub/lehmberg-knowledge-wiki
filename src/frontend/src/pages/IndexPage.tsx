import { RichPreview } from "@/components/RichPreview";
import { Skeleton } from "@/components/ui/skeleton";
import { useListPages } from "@/hooks/useQueries";
import { toRichPreviewHtml } from "@/lib/richPreview";
import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import { motion } from "motion/react";

export function IndexPage() {
  const { data: pages, isLoading, isError } = useListPages();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 page-enter">
      {/* Hero banner */}
      <div className="mb-10 overflow-hidden rounded-lg">
        <img
          src="/assets/uploads/204351-678x450-Cottonwood-Tree-in-Autumn-1.jpg"
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
          {pages.map((page, index) => (
            <motion.div
              key={page.id.toString()}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.25 }}
              data-ocid={`pages.item.${index + 1}`}
            >
              <Link
                to="/page/$id"
                params={{ id: page.id.toString() }}
                className="block p-5 border border-border rounded-lg bg-card hover:border-primary/50 hover:shadow-parchment transition-all duration-200 group"
              >
                <h2 className="font-serif text-xl text-foreground group-hover:text-primary transition-colors mb-2">
                  {page.title}
                </h2>
                {page.body && (
                  <RichPreview
                    html={toRichPreviewHtml(page.body)}
                    className="text-muted-foreground font-body text-sm mb-3"
                  />
                )}
                {page.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {page.tags.map((tag) => (
                      <span
                        key={tag}
                        className="tag-badge"
                        style={{ pointerEvents: "none" }}
                      >
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
