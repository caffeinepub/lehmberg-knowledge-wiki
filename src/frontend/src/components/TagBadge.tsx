import { useNavigate } from "@tanstack/react-router";

interface TagBadgeProps {
  tag: string;
  className?: string;
  style?: React.CSSProperties;
  "data-ocid"?: string;
}

export function TagBadge({
  tag,
  className = "",
  style,
  "data-ocid": ocid,
}: TagBadgeProps) {
  const navigate = useNavigate();
  const tagSlug = tag.startsWith("#") ? tag.slice(1) : tag;
  const displayTag = tag.startsWith("#") ? tag : `#${tag}`;

  return (
    <button
      type="button"
      onClick={() => navigate({ to: "/tag/$tag", params: { tag: tagSlug } })}
      className={`tag-badge ${className}`}
      style={style}
      data-ocid={ocid}
    >
      {displayTag}
    </button>
  );
}
