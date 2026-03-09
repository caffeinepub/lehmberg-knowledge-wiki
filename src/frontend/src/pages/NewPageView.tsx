import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreatePage } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Plus, Save, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
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

function parseTags(input: string): string[] {
  return input
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`));
}

export function NewPageView() {
  const navigate = useNavigate();
  const createPage = useCreatePage();

  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<Section[]>(() => [
    { id: newSectionId(), name: "", text: "" },
  ]);
  const [tags, setTags] = useState("");
  const [titleError, setTitleError] = useState("");

  const addSection = (afterIndex: number) => {
    setSections((prev) => [
      ...prev.slice(0, afterIndex + 1),
      { id: newSectionId(), name: "", text: "" },
      ...prev.slice(afterIndex + 1),
    ]);
  };

  const removeSection = (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const updateSection = (
    sectionId: string,
    field: "name" | "text",
    value: string,
  ) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s)),
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }
    setTitleError("");
    const parsedTags = parseTags(tags);
    const body = sections.map(sectionToString).join(SECTION_DELIMITER);
    try {
      const newId = await createPage.mutateAsync({
        title: title.trim(),
        body,
        tags: parsedTags,
      });
      toast.success("Page created");
      navigate({ to: "/page/$id", params: { id: newId.toString() } });
    } catch {
      toast.error("Failed to create page");
    }
  };

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

      <h1 className="font-serif text-4xl text-foreground mb-8">New Entry</h1>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <Label
            htmlFor="new-title"
            className="font-body text-sm text-muted-foreground mb-1.5 block"
          >
            Title
          </Label>
          <Input
            id="new-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError("");
            }}
            placeholder="e.g. Clay Soil"
            className="font-serif text-xl h-auto py-2 bg-card border-border"
            data-ocid="new_page.title_input"
          />
          {titleError && (
            <p
              className="mt-1.5 text-sm text-destructive font-body"
              data-ocid="new_page.title_error"
            >
              {titleError}
            </p>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-1">
          <Label className="font-body text-sm text-muted-foreground mb-1.5 block">
            Content
          </Label>
          {sections.map((section, idx) => (
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
                className="font-body text-sm bg-muted/50 border-border mb-1.5"
                data-ocid={`new_page.section_name_input.${idx + 1}`}
              />
              <RichTextEditor
                value={section.text}
                onChange={(val) => updateSection(section.id, "text", val)}
                placeholder={idx === 0 ? "Start writing..." : "New section..."}
                data-ocid={`new_page.section_editor.${idx + 1}`}
              />
              <div className="flex justify-center py-2">
                <button
                  type="button"
                  onClick={() => addSection(idx)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs text-muted-foreground border border-dashed border-border hover:border-primary/50 hover:text-primary bg-transparent hover:bg-primary/5 transition-all"
                  title="Add section below"
                  data-ocid={`new_page.section_add_button.${idx + 1}`}
                >
                  <Plus className="w-3 h-3" />
                  Add section
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <Label
            htmlFor="new-tags"
            className="font-body text-sm text-muted-foreground mb-1.5 block"
          >
            Tags{" "}
            <span className="ml-2 text-xs opacity-60">
              Space or comma-separated, e.g. #clay #soil
            </span>
          </Label>
          <Input
            id="new-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="#clay #soil #water-retention"
            className="font-body bg-card border-border"
            data-ocid="new_page.tags_input"
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={createPage.isPending}
            className="gap-2 font-body bg-primary text-primary-foreground"
            data-ocid="new_page.submit_button"
          >
            {createPage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {createPage.isPending ? "Creating..." : "Create Entry"}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/" })}
            className="gap-2 font-body"
            data-ocid="new_page.cancel_button"
          >
            <X className="w-4 h-4" /> Cancel
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
