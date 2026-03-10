import { useNavigate } from "@tanstack/react-router";
import type { WikiPage } from "../backend.d";

interface BodyRendererProps {
  body: string;
  pages: WikiPage[];
}

/** Inject target="_blank" on all external links in raw HTML string. */
function addTargetBlank(html: string): string {
  return html.replace(
    /<a\s([^>]*href="(?!(\/page-link\/|#))[^"]*")[^>]*>/gi,
    (match) => {
      if (/target=/i.test(match)) return match;
      return match.replace(
        "<a ",
        '<a target="_blank" rel="noopener noreferrer" ',
      );
    },
  );
}

const WikiHtml = ({ html }: { html: string }) => (
  <div
    className="wiki-body ql-editor ql-view"
    // biome-ignore lint/security/noDangerouslySetInnerHtml: personal wiki, user-authored content
    dangerouslySetInnerHTML={{ __html: addTargetBlank(html) }}
  />
);

export function BodyRenderer({ body, pages }: BodyRendererProps) {
  const navigate = useNavigate();

  if (!body || body.trim() === "" || body.trim() === "<p><br></p>") {
    return (
      <p className="text-muted-foreground italic font-body">
        No content yet. Click Edit to add content.
      </p>
    );
  }

  const pageMap = new Map<string, bigint>();
  for (const page of pages) {
    pageMap.set(page.title.toLowerCase().trim(), page.id);
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href") ?? "";
    if (href.startsWith("/page-link/")) {
      e.preventDefault();
      const title = decodeURIComponent(href.slice("/page-link/".length));
      const id = pageMap.get(title.toLowerCase().trim());
      if (id !== undefined) {
        navigate({ to: "/page/$id", params: { id: id.toString() } });
      }
    }
    // External links: browser handles target="_blank" natively via the injected attribute.
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: link interception within rendered HTML
    <div onClick={handleClick}>
      <WikiHtml html={body} />
    </div>
  );
}
