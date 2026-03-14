interface RichPreviewProps {
  html: string;
  className?: string;
}

/**
 * Renders a rich preview snippet: bold, italic, underline, lists preserved;
 * brackets and formatting commands stripped.
 */
export function RichPreview({ html, className = "" }: RichPreviewProps) {
  return (
    <div
      className={`rich-preview ${className}`}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitised preview HTML
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
