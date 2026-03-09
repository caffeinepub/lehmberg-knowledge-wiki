import { useNavigate } from "@tanstack/react-router";

interface TagBadgeProps {
  tag: string;
  className?: string;
}

export function TagBadge({ tag, className = "" }: TagBadgeProps) {
  const navigate = useNavigate();
  const tagSlug = tag.startsWith("#") ? tag.slice(1) : tag;
  const displayTag = tag.startsWith("#") ? tag : `#${tag}`;

  return (
    <button
      type="button"
      onClick={() => navigate({ to: "/tag/$tag", params: { tag: tagSlug } })}
      className={`tag-badge ${className}`}
    >
      {displayTag}
    </button>
  );
}
