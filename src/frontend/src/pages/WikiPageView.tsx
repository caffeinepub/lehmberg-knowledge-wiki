import { BodyRenderer } from "@/components/BodyRenderer";
import { LoginDialog } from "@/components/LoginDialog";
import { RichTextEditor } from "@/components/RichTextEditor";
import { TagBadge } from "@/components/TagBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAutoSaveDraft } from "@/hooks/useAutoSaveDraft";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useDeleteDraft,
  useDeletePage,
  useGetDraft,
  useGetPageByTitle,
  useListPages,
  useUpdatePage,
} from "@/hooks/useQueries";
import { slugToTitle, titleToSlug } from "@/lib/slug";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const SECTION_DELIMITER = "\n---\n";
const NAME_BODY_DELIMITER = "\n:::::\n";
let _sectionIdCounter = 0;
const newSectionId = () => `s${++_sectionIdCounter}`;

type Section = { id: string; name: string; text: string };

function sectionToString(s: Section): string {
  if (s.name.trim()) return `${s.name.trim()}${NAME_BODY_DELIMITER}${s.text}`;
  return s.text;
}

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

function parseTags(input: string): string[] {
  return input
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`));
}

function bodyToSections(body: string): Section[] {
  const parts = body.split(SECTION_DELIMITER);
  return (parts.length > 0 ? parts : [""]).map((raw) => ({
    id: newSectionId(),
    ...parseSectionString(raw),
  }));
}

const entryTagStyle: React.CSSProperties = {
  fontFamily: "var(--wt-tags-font)",
  fontSize: "var(--wt-tags-size)" as any,
  fontWeight: "var(--wt-tags-weight)" as any,
  fontStyle: "var(--wt-tags-style)" as any,
  textDecoration: "var(--wt-tags-deco)" as any,
};

export function WikiPageView() {
  const { slug } = useParams({ from: "/page/$slug" });
  const navigate = useNavigate();
  const pageTitle = slugToTitle(decodeURIComponent(slug));
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const { data: page, isLoading, isError } = useGetPageByTitle(pageTitle);
  const { data: allPages = [] } = useListPages();

  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();
  const deleteDraft = useDeleteDraft();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSections, setEditSections] = useState<Section[]>([]);
  const [editTags, setEditTags] = useState("");
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const editMountedRef = useRef(false);

  const draftKey = page ? page.id.toString() : slug;
  const { data: draft, isSuccess: draftLoaded } = useGetDraft(draftKey);

  const handleEditStart = () => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }
    if (!page) return;
    editMountedRef.current = false;
    setEditTitle(page.title);
    setEditSections(bodyToSections(page.body));
    setEditTags(page.tags.join(" "));
    setIsEditing(true);
  };

  const handleDeleteClick = () => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
    }
  };

  useEffect(() => {
    if (!isEditing || !draftLoaded || editMountedRef.current) return;
    editMountedRef.current = true;

    if (draft && page) {
      const draftTime = Number(draft.savedAt);
      const pageTime = Number(page.updatedAt);
      if (draftTime > pageTime) {
        setEditTitle(draft.title);
        setEditTags(draft.tags.join(" "));
        setEditSections(bodyToSections(draft.body));
        toast("Draft restored", {
          description: "A newer unsaved draft was restored.",
        });
      }
    }
  }, [isEditing, draftLoaded, draft, page]);

  const editBody = editSections.map(sectionToString).join(SECTION_DELIMITER);

  const { status: draftStatus } = useAutoSaveDraft({
    key: draftKey,
    title: editTitle,
    body: editBody,
    tags: editTags,
    enabled: isEditing && editMountedRef.current,
  });

  const handleCancel = () => {
    editMountedRef.current = false;
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!page) return;
    const tags = parseTags(editTags);
    try {
      await updatePage.mutateAsync({
        id: page.id,
        title: editTitle.trim(),
        body: editBody,
        tags,
      });
      try {
        await deleteDraft.mutateAsync(draftKey);
      } catch {
        // silently ignore
      }
      editMountedRef.current = false;
      setIsEditing(false);
      toast.success("Page saved");
      const newSlug = titleToSlug(editTitle.trim());
      if (newSlug !== slug) {
        navigate({ to: "/page/$slug", params: { slug: newSlug } });
      }
    } catch {
      toast.error("Failed to save page");
    }
  };

  const handleDelete = async () => {
    if (!page) return;
    try {
      await deletePage.mutateAsync(page.id);
      toast.success("Page deleted");
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to delete page");
    }
  };

  const addSection = (afterIndex: number) => {
    setEditSections((prev) => [
      ...prev.slice(0, afterIndex + 1),
      { id: newSectionId(), name: "", text: "" },
      ...prev.slice(afterIndex + 1),
    ]);
  };

  const removeSection = (sectionId: string) => {
    setEditSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const updateSection = (
    sectionId: string,
    field: "name" | "text",
    value: string,
  ) => {
    setEditSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s)),
    );
  };

  if (isLoading) {
    return (
      <main
        className="max-w-3xl mx-auto px-4 sm:px-6 py-10"
        data-ocid="page.loading_state"
      >
        <Skeleton className="h-8 w-24 mb-8" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-6" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </main>
    );
  }

  if (isError || !page) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div
          className="p-6 border border-destructive/30 rounded-lg bg-destructive/5 text-destructive"
          data-ocid="page.error_state"
        >
          <p className="font-body text-lg">
            {isError ? "Failed to load page." : "Page not found."}
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="mt-3 text-sm underline font-body"
          >
            Back to all pages
          </button>
        </div>
      </main>
    );
  }

  const updatedDate = new Date(
    Number(page.updatedAt) / 1_000_000,
  ).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const viewSections = page.body
    .split(SECTION_DELIMITER)
    .map(parseSectionString);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 page-enter">
      <button
        type="button"
        onClick={() => navigate({ to: "/" })}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-body mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All entries
      </button>

      {isEditing ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-5"
        >
          <div>
            <Label
              htmlFor="edit-title"
              className="font-body text-sm text-muted-foreground mb-1.5 block"
            >
              Title
            </Label>
            <Input
              id="edit-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="font-serif text-2xl h-auto py-2 bg-card border-border"
              data-ocid="page.input"
            />
          </div>

          <div className="space-y-1">
            <Label className="font-body text-sm text-muted-foreground mb-1.5 block">
              Content
            </Label>
            {editSections.map((section, idx) => (
              <div key={section.id} className="relative group mb-4">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    className="absolute -top-2.5 right-0 z-10 w-5 h-5 flex items-center justify-center rounded-full bg-muted hover:bg-destructive/15 hover:text-destructive text-muted-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Remove section"
                    aria-label="Remove section"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <Input
                  value={section.name}
                  onChange={(e) =>
                    updateSection(section.id, "name", e.target.value)
                  }
                  placeholder="Section name (optional)"
                  className="font-serif text-base bg-muted/50 border-border mb-1.5"
                />
                <RichTextEditor
                  value={section.text}
                  onChange={(val) => updateSection(section.id, "text", val)}
                  placeholder={
                    idx === 0 ? "Start writing..." : "New section..."
                  }
                  data-ocid="page.editor"
                />
                <div className="flex justify-center py-2">
                  <button
                    type="button"
                    onClick={() => addSection(idx)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs text-muted-foreground border border-dashed border-border hover:border-primary/50 hover:text-primary bg-transparent hover:bg-primary/5 transition-all"
                  >
                    <Plus className="w-3 h-3" /> Add section
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <Label
              htmlFor="edit-tags"
              className="font-body text-sm text-muted-foreground mb-1.5 block"
            >
              Tags{" "}
              <span className="ml-2 text-xs opacity-60">
                Space or comma-separated, e.g. #clay #soil
              </span>
            </Label>
            <Input
              id="edit-tags"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="#clay #soil #water-retention"
              className="font-body bg-card border-border"
              data-ocid="page.input"
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={updatePage.isPending}
              className="gap-2 font-body bg-primary text-primary-foreground"
              data-ocid="page.save_button"
            >
              {updatePage.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {updatePage.isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2 font-body"
              data-ocid="page.cancel_button"
            >
              <X className="w-4 h-4" /> Cancel
            </Button>
            {draftStatus === "saving" && (
              <span
                className="text-xs text-muted-foreground italic"
                data-ocid="page.loading_state"
              >
                Saving draft...
              </span>
            )}
            {draftStatus === "saved" && (
              <span
                className="text-xs text-muted-foreground italic"
                data-ocid="page.success_state"
              >
                Draft saved
              </span>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="flex items-start justify-between gap-4"
            style={{ marginBottom: "var(--wt-title-section-gap)" }}
          >
            <h1 className="wiki-entry-title text-foreground leading-tight">
              {page.title}
            </h1>
            <div className="flex items-center gap-2 shrink-0 mt-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditStart}
                className="gap-1.5 font-body"
                data-ocid="page.edit_button"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Button>
              {isAuthenticated ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 font-body text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                      data-ocid="page.delete_button"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-ocid="confirm.dialog">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-serif">
                        Delete this page?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-body">
                        This will permanently delete &ldquo;{page.title}&rdquo;.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className="font-body"
                        data-ocid="confirm.cancel_button"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="font-body bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-ocid="confirm.confirm_button"
                      >
                        {deletePage.isPending ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="gap-1.5 font-body text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                  data-ocid="page.delete_button"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              )}
            </div>
          </div>

          <div className="mb-8 space-y-6">
            {viewSections.map((section, idx) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: view-only list
              <div key={idx}>
                {idx > 0 && <hr className="border-border mb-6" />}
                {section.name && (
                  <h2
                    className="wiki-entry-section text-foreground block"
                    style={{ marginBottom: "var(--wt-section-body-gap)" }}
                  >
                    {section.name}
                  </h2>
                )}
                <BodyRenderer body={section.text} pages={allPages} />
              </div>
            ))}
          </div>

          {page.tags.length > 0 && (
            <div className="border-t border-border pt-6">
              <p className="text-xs text-muted-foreground font-body mb-3 uppercase tracking-widest">
                Tags
              </p>
              <div className="flex flex-wrap gap-2" data-ocid="tag.list">
                {page.tags.map((tag, i) => (
                  <TagBadge
                    key={tag}
                    tag={tag}
                    style={entryTagStyle}
                    data-ocid={`tag.item.${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground font-body mt-10 text-center italic">
            Last updated {updatedDate}
          </p>
        </motion.div>
      )}

      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </main>
  );
}
