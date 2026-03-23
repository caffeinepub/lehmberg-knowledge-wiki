import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTypography } from "@/contexts/TypographyContext";
import { DEFAULT_BANNER, useBannerUrl } from "@/hooks/useBannerUrl";
import {
  DEFAULT_SETTINGS,
  FONT_OPTIONS,
  type TextStyle,
  type TypographySettings,
} from "@/lib/typography";
import { Check, ChevronDown, ImageIcon, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

function GapInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      max={200}
      value={value}
      title="gap"
      onChange={(e) =>
        onChange(Math.max(0, Math.min(200, Number(e.target.value))))
      }
      className="w-14 h-8 rounded-md border border-border bg-card px-2 text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
    />
  );
}

function LineHeightInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="number"
      min={0.8}
      max={4.0}
      step={0.1}
      value={value.toFixed(1)}
      title="line-height"
      onChange={(e) =>
        onChange(Math.max(0.8, Math.min(4.0, Number(e.target.value))))
      }
      className="w-14 h-8 rounded-md border border-border bg-card px-2 text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
    />
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
  gap,
  onGapChange,
  onChange,
  lineHeight,
  onLineHeightChange,
}: {
  label: string;
  value: TextStyle;
  gap: number;
  onGapChange: (v: number) => void;
  onChange: (v: TextStyle) => void;
  lineHeight?: number;
  onLineHeightChange?: (v: number) => void;
}) {
  const set = (patch: Partial<TextStyle>) => onChange({ ...value, ...patch });
  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      <span className="w-16 text-sm text-muted-foreground font-body shrink-0">
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
      <GapInput value={gap} onChange={onGapChange} />
      {lineHeight !== undefined && onLineHeightChange && (
        <LineHeightInput value={lineHeight} onChange={onLineHeightChange} />
      )}
    </div>
  );
}

// ---- Entry preview ----
function EntryPreview({ draft }: { draft: TypographySettings }) {
  return (
    <div
      className="rounded-lg border border-border bg-card p-6"
      style={{ minHeight: 220 }}
    >
      <h1
        style={{
          ...styleToCSS(draft.entryTitle),
          marginTop: draft.entryTitleGap,
          lineHeight: 1.1,
        }}
      >
        Sample Entry Title
      </h1>
      <h2
        style={{
          ...styleToCSS(draft.entrySection),
          display: "block",
          marginTop: draft.entrySectionGap,
          lineHeight: 1.2,
        }}
      >
        Section Name
      </h2>
      <p
        style={{
          ...styleToCSS(draft.entryBody),
          marginTop: draft.entryBodyGap,
          lineHeight: draft.entryBodyLineHeight,
        }}
      >
        This is a sample body paragraph. It shows how body text will appear.
        Adjust the controls to change the look.
      </p>
      <div className="flex gap-1.5" style={{ marginTop: draft.entryTagsGap }}>
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
    <div
      className="rounded-lg border border-border bg-card p-5 max-w-sm"
      style={{ minHeight: 180 }}
    >
      <h2
        style={{
          ...styleToCSS(draft.previewTitle),
          marginTop: draft.previewTitleGap,
          lineHeight: 1.2,
        }}
      >
        Sample Entry Title
      </h2>
      <span
        style={{
          ...styleToCSS(draft.previewSection),
          display: "block",
          marginTop: draft.previewSectionGap,
          lineHeight: 1.3,
        }}
      >
        Section Name
      </span>
      <p
        style={{
          ...styleToCSS(draft.previewBody),
          marginTop: draft.previewBodyGap,
          lineHeight: draft.previewBodyLineHeight,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
        }}
      >
        A short preview of the entry body text, truncated to show how it appears
        in the overview grid...
      </p>
      <div className="flex gap-1.5" style={{ marginTop: draft.previewTagsGap }}>
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

// ---- Crop Modal ----
interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function CropModal({
  src,
  onConfirm,
  onCancel,
}: {
  src: string;
  onConfirm: (cropped: string) => void;
  onCancel: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [rect, setRect] = useState<CropRect | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const getRelativePos = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const bounds = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(bounds.width, e.clientX - bounds.left)),
      y: Math.max(0, Math.min(bounds.height, e.clientY - bounds.top)),
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getRelativePos(e);
    dragStart.current = pos;
    setRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragStart.current) return;
    const pos = getRelativePos(e);
    const x = Math.min(dragStart.current.x, pos.x);
    const y = Math.min(dragStart.current.y, pos.y);
    const w = Math.abs(pos.x - dragStart.current.x);
    const h = Math.abs(pos.y - dragStart.current.y);
    setRect({ x, y, w, h });
  };

  const onMouseUp = () => {
    dragStart.current = null;
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container || !rect || rect.w < 4 || rect.h < 4) {
      // No crop selected — use original
      onConfirm(src);
      return;
    }
    const displayW = container.clientWidth;
    const displayH = container.clientHeight;
    const scaleX = naturalSize.w / displayW;
    const scaleY = naturalSize.h / displayH;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(rect.w * scaleX);
    canvas.height = Math.round(rect.h * scaleY);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      onConfirm(src);
      return;
    }
    ctx.drawImage(
      img,
      rect.x * scaleX,
      rect.y * scaleY,
      rect.w * scaleX,
      rect.h * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    onConfirm(canvas.toDataURL("image/jpeg", 0.92));
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent
        className="max-w-2xl"
        data-ocid="settings.banner.crop.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-serif">Crop Image</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground font-body -mt-2">
          Drag to select the area you want to keep. Leave empty to use the full
          image.
        </p>

        {/* Image + crop overlay */}
        <div
          ref={containerRef}
          className="relative select-none overflow-hidden rounded-md border border-border bg-muted cursor-crosshair"
          style={{ maxHeight: 400, userSelect: "none" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <img
            ref={imgRef}
            src={src}
            alt="Crop preview"
            draggable={false}
            onLoad={(e) => {
              const el = e.currentTarget;
              setNaturalSize({ w: el.naturalWidth, h: el.naturalHeight });
            }}
            className="w-full h-auto block pointer-events-none"
            style={{ maxHeight: 400, objectFit: "contain" }}
          />
          {/* Darkened overlay outside selection */}
          {rect && rect.w > 2 && rect.h > 2 && (
            <>
              {/* Semi-transparent overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "rgba(0,0,0,0.45)" }}
              />
              {/* Bright crop window cutout (via box-shadow) */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: rect.x,
                  top: rect.y,
                  width: rect.w,
                  height: rect.h,
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                  border: "2px solid white",
                  background: "transparent",
                }}
              />
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="font-body"
            data-ocid="settings.banner.crop.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="font-body"
            data-ocid="settings.banner.crop.confirm_button"
          >
            {rect && rect.w > 2 && rect.h > 2 ? "Crop & Use" : "Use Full Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Banner section ----
function BannerSection() {
  const [savedBannerUrl, setSavedBannerUrl] = useBannerUrl();
  const [pending, setPending] = useState<string>(savedBannerUrl);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") setCropSrc(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = (cropped: string) => {
    setPending(cropped);
    setCropSrc(null);
  };

  const handleSave = () => {
    setSavedBannerUrl(pending);
    toast.success("Banner updated");
  };

  const handleReset = () => {
    setPending(DEFAULT_BANNER);
    setSavedBannerUrl(DEFAULT_BANNER);
    toast("Banner reset to default");
  };

  // Keep pending in sync if saved URL changes externally
  useEffect(() => {
    setPending(savedBannerUrl);
  }, [savedBannerUrl]);

  return (
    <>
      {cropSrc && (
        <CropModal
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <Collapsible open={bannerOpen} onOpenChange={setBannerOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-4 border-b border-border pb-3 group"
            data-ocid="settings.banner.toggle"
          >
            <h2 className="font-serif text-2xl text-foreground">Banner</h2>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                bannerOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent
          className="space-y-4 pt-5"
          data-ocid="settings.banner.section"
        >
          {/* Live preview */}
          <div className="overflow-hidden rounded-lg border border-border">
            {pending ? (
              <img
                src={pending}
                alt="Banner preview"
                className="w-full h-32 sm:h-48 object-cover"
              />
            ) : (
              <div className="w-full h-32 sm:h-48 bg-muted flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-muted-foreground opacity-40" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="rounded-lg border border-border bg-card/50 p-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="font-body text-xs text-muted-foreground uppercase tracking-widest">
                Upload image
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-body gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  data-ocid="settings.banner.upload_button"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Choose file
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <span className="text-xs text-muted-foreground font-body italic">
                  JPG, PNG, WebP recommended
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-body text-xs text-muted-foreground uppercase tracking-widest">
                Or paste image URL
              </Label>
              <input
                type="url"
                value={pending.startsWith("data:") ? "" : pending}
                placeholder="https://example.com/image.jpg"
                onChange={(e) => setPending(e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                data-ocid="settings.banner.input"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={handleSave}
                className="gap-1.5 font-body bg-primary text-primary-foreground"
                data-ocid="settings.banner.save_button"
              >
                <Check className="w-3.5 h-3.5" />
                Save banner
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 font-body text-muted-foreground"
                data-ocid="settings.banner.secondary_button"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}

// ---- Main page ----
export function SettingsPage() {
  const { settings, applyAndSave } = useTypography();
  const [draft, setDraft] = useState<TypographySettings>(() =>
    JSON.parse(JSON.stringify(settings)),
  );
  const [opticsOpen, setOpticsOpen] = useState(false);

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
      <h1 className="font-serif text-4xl text-foreground">Settings</h1>

      {/* Banner section (collapsible) */}
      <BannerSection />

      {/* Optics collapsible */}
      <Collapsible open={opticsOpen} onOpenChange={setOpticsOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-4 border-b border-border pb-3 group"
            data-ocid="settings.optics.toggle"
          >
            <h2 className="font-serif text-2xl text-foreground">Optics</h2>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                opticsOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-12 pt-8">
          {/* Save/reset for typography */}
          <div className="flex items-center justify-between gap-4">
            <span className="font-body text-sm text-muted-foreground">
              Adjust entry and preview card typography
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 font-body text-muted-foreground"
                data-ocid="settings.optics.reset_button"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="gap-1.5 font-body bg-primary text-primary-foreground"
                data-ocid="settings.optics.save_button"
              >
                <Check className="w-3.5 h-3.5" />
                Save
              </Button>
            </div>
          </div>

          {/* Section 1: Entry view formatting */}
          <SettingsSection title="Entry View Formatting">
            {/* Fixed-height preview wrapper so controls don't shift */}
            <div style={{ minHeight: 260 }}>
              <EntryPreview draft={draft} />
            </div>
            <div className="space-y-1 pt-1">
              <Label className="font-body text-xs text-muted-foreground uppercase tracking-widest block mb-2">
                Controls
              </Label>
              <div className="divide-y divide-border rounded-lg border border-border bg-card/50 px-4">
                <TextStyleControls
                  label="Title"
                  value={draft.entryTitle}
                  gap={draft.entryTitleGap}
                  onGapChange={(v) =>
                    setDraft((d) => ({ ...d, entryTitleGap: v }))
                  }
                  onChange={(v) => setEntry("entryTitle", v)}
                />
                <TextStyleControls
                  label="Section"
                  value={draft.entrySection}
                  gap={draft.entrySectionGap}
                  onGapChange={(v) =>
                    setDraft((d) => ({ ...d, entrySectionGap: v }))
                  }
                  onChange={(v) => setEntry("entrySection", v)}
                />
                <TextStyleControls
                  label="Body"
                  value={draft.entryBody}
                  gap={draft.entryBodyGap}
                  onGapChange={(v) =>
                    setDraft((d) => ({ ...d, entryBodyGap: v }))
                  }
                  onChange={(v) => setEntry("entryBody", v)}
                  lineHeight={draft.entryBodyLineHeight}
                  onLineHeightChange={(v) =>
                    setDraft((d) => ({ ...d, entryBodyLineHeight: v }))
                  }
                />
                <TextStyleControls
                  label="Tags"
                  value={draft.entryTags}
                  gap={draft.entryTagsGap}
                  onGapChange={(v) =>
                    setDraft((d) => ({ ...d, entryTagsGap: v }))
                  }
                  onChange={(v) => setEntry("entryTags", v)}
                />
              </div>
            </div>
          </SettingsSection>

          {/* Section 2: Preview card formatting */}
          <SettingsSection title="Preview Card Formatting">
            <div style={{ minHeight: 220 }}>
              <PreviewCardPreview draft={draft} />
            </div>
            <div className="space-y-1 pt-1">
              <Label className="font-body text-xs text-muted-foreground uppercase tracking-widest block mb-2">
                Controls
              </Label>
              <div className="divide-y divide-border rounded-lg border border-border bg-card/50 px-4">
                <TextStyleControls
                  label="Title"
                  value={draft.previewTitle}
                  gap={draft.previewTitleGap}
                  onGapChange={(v) =>
                    setDraft((d) => ({ ...d, previewTitleGap: v }))
                  }
                  onChange={(v) => setPreview("previewTitle", v)}
                />
                <TextStyleControls
                  label="Section"
                  value={draft.previewSection}
                  gap={draft.previewSectionGap}
                  onGapChange={(v) =>
                    setDraft((d) => ({ ...d, previewSectionGap: v }))
                  }
                  onChange={(v) => setPreview("previewSection", v)}
                />
                <TextStyleControls
                  label="Body"
                  value={draft.previewBody}
                  gap={draft.previewBodyGap}
                  onGapChange={(v) =>
                    setDraft((d) => ({ ...d, previewBodyGap: v }))
                  }
                  onChange={(v) => setPreview("previewBody", v)}
                  lineHeight={draft.previewBodyLineHeight}
                  onLineHeightChange={(v) =>
                    setDraft((d) => ({ ...d, previewBodyLineHeight: v }))
                  }
                />
                <TextStyleControls
                  label="Tags"
                  value={draft.previewTags}
                  gap={draft.previewTagsGap}
                  onGapChange={(v) =>
                    setDraft((d) => ({ ...d, previewTagsGap: v }))
                  }
                  onChange={(v) => setPreview("previewTags", v)}
                />
              </div>
            </div>
          </SettingsSection>
        </CollapsibleContent>
      </Collapsible>
    </main>
  );
}
