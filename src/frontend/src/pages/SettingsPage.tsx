import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTypography } from "@/contexts/TypographyContext";
import {
  DEFAULT_SETTINGS,
  FONT_OPTIONS,
  type TextStyle,
  type TypographySettings,
} from "@/lib/typography";
import { Check, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ---- helpers ----
function styleToCSS(ts: TextStyle): React.CSSProperties {
  return {
    fontFamily: ts.fontFamily,
    fontSize: ts.fontSize,
    fontWeight: ts.bold ? 700 : 400,
    fontStyle: ts.italic ? "italic" : "normal",
    textDecoration: ts.underline ? "underline" : "none",
  };
}

// ---- sub-components ----
function FontSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-md border border-border bg-card px-2 text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      style={{ fontFamily: value }}
    >
      {FONT_OPTIONS.map((opt) => (
        <option
          key={opt.value}
          value={opt.value}
          style={{ fontFamily: opt.value }}
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function SizeInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={8}
        max={96}
        value={value}
        onChange={(e) =>
          onChange(Math.max(8, Math.min(96, Number(e.target.value))))
        }
        className="w-16 h-8 rounded-md border border-border bg-card px-2 text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <span className="text-xs text-muted-foreground font-body">px</span>
    </div>
  );
}

function SpacingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      <span className="w-44 text-sm text-muted-foreground font-body shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          max={200}
          value={value}
          onChange={(e) =>
            onChange(Math.max(0, Math.min(200, Number(e.target.value))))
          }
          className="w-16 h-8 rounded-md border border-border bg-card px-2 text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <span className="text-xs text-muted-foreground font-body">px</span>
      </div>
    </div>
  );
}

function StyleToggle({
  active,
  onClick,
  label,
  style,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-8 h-8 rounded-md border text-sm transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
      }`}
      style={style}
      title={label}
    >
      {label[0]}
    </button>
  );
}

function TextStyleControls({
  label,
  value,
  onChange,
}: {
  label: string;
  value: TextStyle;
  onChange: (v: TextStyle) => void;
}) {
  const set = (patch: Partial<TextStyle>) => onChange({ ...value, ...patch });
  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      <span className="w-24 text-sm text-muted-foreground font-body shrink-0">
        {label}
      </span>
      <FontSelect
        value={value.fontFamily}
        onChange={(fontFamily) => set({ fontFamily })}
      />
      <SizeInput
        value={value.fontSize}
        onChange={(fontSize) => set({ fontSize })}
      />
      <div className="flex items-center gap-1">
        <StyleToggle
          active={value.bold}
          onClick={() => set({ bold: !value.bold })}
          label="Bold"
          style={{ fontWeight: 700 }}
        />
        <StyleToggle
          active={value.italic}
          onClick={() => set({ italic: !value.italic })}
          label="Italic"
          style={{ fontStyle: "italic" }}
        />
        <StyleToggle
          active={value.underline}
          onClick={() => set({ underline: !value.underline })}
          label="Underline"
          style={{ textDecoration: "underline" }}
        />
      </div>
    </div>
  );
}

// ---- Entry preview ----
function EntryPreview({ draft }: { draft: TypographySettings }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <h1
        style={{
          ...styleToCSS(draft.entryTitle),
          marginBottom: draft.entryTitleToSectionGap,
        }}
      >
        Sample Entry Title
      </h1>
      <div>
        <h2
          style={{
            ...styleToCSS(draft.entrySection),
            display: "block",
            marginBottom: draft.entrySectionToBodyGap,
          }}
        >
          Section Name
        </h2>
        <p style={styleToCSS(draft.entryBody)}>
          This is a sample body paragraph. It shows how the body text of an
          entry will appear to readers. Adjust the controls below to change the
          look.
        </p>
      </div>
      <div className="flex gap-1.5 mt-3">
        <span className="tag-badge" style={styleToCSS(draft.entryTags)}>
          #example
        </span>
        <span className="tag-badge" style={styleToCSS(draft.entryTags)}>
          #farmstead
        </span>
      </div>
    </div>
  );
}

// ---- Preview card preview ----
function PreviewCardPreview({ draft }: { draft: TypographySettings }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 max-w-sm">
      <h2
        style={{
          ...styleToCSS(draft.previewTitle),
          marginBottom: draft.previewTitleToSectionGap,
        }}
      >
        Sample Entry Title
      </h2>
      <div style={{ marginBottom: "0.25rem" }}>
        <span
          style={{
            ...styleToCSS(draft.previewSection),
            display: "block",
            marginBottom: draft.previewSectionToBodyGap,
          }}
        >
          Section Name
        </span>
        <p
          style={{
            ...styleToCSS(draft.previewBody),
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          A short preview of the entry body text, truncated to show how it
          appears in the overview grid...
        </p>
      </div>
      <div className="flex gap-1.5 mt-2">
        <span className="tag-badge" style={styleToCSS(draft.previewTags)}>
          #example
        </span>
        <span className="tag-badge" style={styleToCSS(draft.previewTags)}>
          #sample
        </span>
      </div>
    </div>
  );
}

// ---- Section wrapper ----
function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <h2 className="font-serif text-2xl text-foreground border-b border-border pb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

// ---- Main page ----
export function SettingsPage() {
  const { settings, applyAndSave } = useTypography();
  const [draft, setDraft] = useState<TypographySettings>(() =>
    JSON.parse(JSON.stringify(settings)),
  );

  const setEntry = (
    key: keyof Pick<
      TypographySettings,
      "entryTitle" | "entrySection" | "entryBody" | "entryTags"
    >,
    val: TextStyle,
  ) => setDraft((d) => ({ ...d, [key]: val }));

  const setPreview = (
    key: keyof Pick<
      TypographySettings,
      "previewTitle" | "previewSection" | "previewBody" | "previewTags"
    >,
    val: TextStyle,
  ) => setDraft((d) => ({ ...d, [key]: val }));

  const handleSave = () => {
    applyAndSave(draft);
    toast.success("Typography settings saved");
  };

  const handleReset = () => {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    setDraft(fresh);
    applyAndSave(fresh);
    toast("Settings reset to defaults");
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 page-enter space-y-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-4xl text-foreground">Settings</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 font-body text-muted-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="gap-1.5 font-body bg-primary text-primary-foreground"
          >
            <Check className="w-3.5 h-3.5" />
            Save
          </Button>
        </div>
      </div>

      {/* Section 1: Entry view formatting */}
      <SettingsSection title="Entry View Formatting">
        <EntryPreview draft={draft} />
        <div className="space-y-1 pt-1">
          <Label className="font-body text-xs text-muted-foreground uppercase tracking-widest block mb-2">
            Controls
          </Label>
          <div className="divide-y divide-border rounded-lg border border-border bg-card/50 px-4">
            <TextStyleControls
              label="Title"
              value={draft.entryTitle}
              onChange={(v) => setEntry("entryTitle", v)}
            />
            <TextStyleControls
              label="Section"
              value={draft.entrySection}
              onChange={(v) => setEntry("entrySection", v)}
            />
            <TextStyleControls
              label="Body"
              value={draft.entryBody}
              onChange={(v) => setEntry("entryBody", v)}
            />
            <TextStyleControls
              label="Tags"
              value={draft.entryTags}
              onChange={(v) => setEntry("entryTags", v)}
            />
            <SpacingInput
              label="Title \u2192 Section gap"
              value={draft.entryTitleToSectionGap}
              onChange={(v) =>
                setDraft((d) => ({ ...d, entryTitleToSectionGap: v }))
              }
            />
            <SpacingInput
              label="Section \u2192 Body gap"
              value={draft.entrySectionToBodyGap}
              onChange={(v) =>
                setDraft((d) => ({ ...d, entrySectionToBodyGap: v }))
              }
            />
          </div>
        </div>
      </SettingsSection>

      {/* Section 2: Preview card formatting */}
      <SettingsSection title="Preview Card Formatting">
        <PreviewCardPreview draft={draft} />
        <div className="space-y-1 pt-1">
          <Label className="font-body text-xs text-muted-foreground uppercase tracking-widest block mb-2">
            Controls
          </Label>
          <div className="divide-y divide-border rounded-lg border border-border bg-card/50 px-4">
            <TextStyleControls
              label="Title"
              value={draft.previewTitle}
              onChange={(v) => setPreview("previewTitle", v)}
            />
            <TextStyleControls
              label="Section"
              value={draft.previewSection}
              onChange={(v) => setPreview("previewSection", v)}
            />
            <TextStyleControls
              label="Body"
              value={draft.previewBody}
              onChange={(v) => setPreview("previewBody", v)}
            />
            <TextStyleControls
              label="Tags"
              value={draft.previewTags}
              onChange={(v) => setPreview("previewTags", v)}
            />
            <SpacingInput
              label="Title \u2192 Section gap"
              value={draft.previewTitleToSectionGap}
              onChange={(v) =>
                setDraft((d) => ({ ...d, previewTitleToSectionGap: v }))
              }
            />
            <SpacingInput
              label="Section \u2192 Body gap"
              value={draft.previewSectionToBodyGap}
              onChange={(v) =>
                setDraft((d) => ({ ...d, previewSectionToBodyGap: v }))
              }
            />
          </div>
        </div>
      </SettingsSection>
    </main>
  );
}
