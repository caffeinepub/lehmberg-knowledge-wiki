import { titleToSlug } from "@/lib/slug";
import { useNavigate } from "@tanstack/react-router";
import type { WikiPage } from "../backend.d";

interface BodyRendererProps {
  body: string;
  pages: WikiPage[];
  className?: string;
}

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

function extractYouTubeId(url: string): string | null {
  const shortMatch = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const longMatch = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (longMatch) return longMatch[1];
  return null;
}

function embedYouTube(html: string): string {
  return html.replace(
    /<a\s[^>]*href="([^"]*(?:youtube\.com\/watch|youtu\.be\/)[^"]*)[^>]*>[^<]*<\/a>/gi,
    (match, url: string) => {
      const videoId = extractYouTubeId(url);
      if (!videoId) return match;
      return `<div class="yt-embed-wrapper" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:1rem 0;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="YouTube video"></iframe></div>`;
    },
  );
}

const WikiHtml = ({
  html,
  className,
}: { html: string; className?: string }) => (
  <div
    className={`wiki-body ql-editor ql-view wiki-entry-body ${className ?? ""}`}
    // biome-ignore lint/security/noDangerouslySetInnerHtml: personal wiki, user-authored content
    dangerouslySetInnerHTML={{ __html: embedYouTube(addTargetBlank(html)) }}
  />
);

export function BodyRenderer({ body, pages, className }: BodyRendererProps) {
  const navigate = useNavigate();

  if (!body || body.trim() === "" || body.trim() === "<p><br></p>") {
    return (
      <p className="text-muted-foreground italic font-body">
        No content yet. Click Edit to add content.
      </p>
    );
  }

  const pageMap = new Map<string, string>();
  for (const page of pages) {
    pageMap.set(page.title.toLowerCase().trim(), page.title);
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href") ?? "";
    if (href.startsWith("/page-link/")) {
      e.preventDefault();
      const title = decodeURIComponent(href.slice("/page-link/".length));
      const canonicalTitle = pageMap.get(title.toLowerCase().trim());
      if (canonicalTitle) {
        navigate({
          to: "/page/$slug",
          params: { slug: titleToSlug(canonicalTitle) },
        });
      }
    }
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: link interception within rendered HTML
    <div onClick={handleClick}>
      <WikiHtml html={body} className={className} />
    </div>
  );
}
