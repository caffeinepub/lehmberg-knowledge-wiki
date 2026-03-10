import { useEffect, useRef, useState } from "react";
import { useActor } from "./useActor";

export type DraftStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSaveDraft({
  key,
  title,
  body,
  tags,
  enabled,
}: {
  key: string;
  title: string;
  body: string;
  tags: string;
  enabled: boolean;
}): { status: DraftStatus } {
  const { actor } = useActor();
  const [status, setStatus] = useState<DraftStatus>("idle");
  const hasMounted = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: key/body/tags intentionally included to trigger re-save when content changes
  useEffect(() => {
    // Skip initial mount to avoid saving on restore
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    if (!enabled || !actor) return;
    if (!title.trim()) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("saving");

    const savedKey = key;
    const savedTitle = title;
    const savedBody = body;
    const savedTags = tags;
    const savedActor = actor;

    timerRef.current = setTimeout(async () => {
      if (!savedTitle.trim()) {
        setStatus("idle");
        return;
      }
      try {
        const parsedTags = savedTags
          .split(/[,\s]+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => (s.startsWith("#") ? s : `#${s}`));
        await (savedActor as any).saveDraft(
          savedKey,
          savedTitle,
          savedBody,
          parsedTags,
        );
        setStatus("saved");
      } catch {
        setStatus("idle");
      }
    }, 800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key, title, body, tags, enabled, actor]);

  return { status };
}
