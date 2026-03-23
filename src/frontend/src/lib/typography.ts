export interface TextStyle {
  fontFamily: string;
  fontSize: number; // px
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface TypographySettings {
  // Full entry view
  entryTitle: TextStyle;
  entrySection: TextStyle;
  entryBody: TextStyle;
  entryTags: TextStyle;
  // Overview preview cards
  previewTitle: TextStyle;
  previewSection: TextStyle;
  previewBody: TextStyle;
  previewTags: TextStyle;
  // Per-element gaps (space ABOVE each element), px
  entryTitleGap: number;
  entrySectionGap: number;
  entryBodyGap: number;
  entryTagsGap: number;
  previewTitleGap: number;
  previewSectionGap: number;
  previewBodyGap: number;
  previewTagsGap: number;
  // Line-height for body text (unitless)
  entryBodyLineHeight: number;
  previewBodyLineHeight: number;
}

export const FONT_OPTIONS = [
  { label: "Instrument Serif", value: "'Instrument Serif', Georgia, serif" },
  { label: "Crimson Pro", value: "'Crimson Pro', Georgia, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Helvetica Neue", value: "'Helvetica Neue', Helvetica, sans-serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
];

export const DEFAULT_SETTINGS: TypographySettings = {
  entryTitle: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: 40,
    bold: false,
    italic: false,
    underline: false,
  },
  entrySection: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: 24,
    bold: false,
    italic: false,
    underline: false,
  },
  entryBody: {
    fontFamily: "'Crimson Pro', Georgia, serif",
    fontSize: 17,
    bold: false,
    italic: false,
    underline: false,
  },
  entryTags: {
    fontFamily: "'Crimson Pro', Georgia, serif",
    fontSize: 13,
    bold: false,
    italic: false,
    underline: false,
  },
  previewTitle: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: 20,
    bold: false,
    italic: false,
    underline: false,
  },
  previewSection: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: 15,
    bold: false,
    italic: false,
    underline: false,
  },
  previewBody: {
    fontFamily: "'Crimson Pro', Georgia, serif",
    fontSize: 14,
    bold: false,
    italic: false,
    underline: false,
  },
  previewTags: {
    fontFamily: "'Crimson Pro', Georgia, serif",
    fontSize: 12,
    bold: false,
    italic: false,
    underline: false,
  },
  // All gaps default to 0
  entryTitleGap: 0,
  entrySectionGap: 0,
  entryBodyGap: 0,
  entryTagsGap: 0,
  previewTitleGap: 0,
  previewSectionGap: 0,
  previewBodyGap: 0,
  previewTagsGap: 0,
  // Default line-heights
  entryBodyLineHeight: 1.5,
  previewBodyLineHeight: 1.5,
};

const STORAGE_KEY = "wiki-typography-settings";

export function loadSettings(): TypographySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(s: TypographySettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function applySettingsToDom(s: TypographySettings): void {
  const r = document.documentElement;
  const set = (k: string, ts: TextStyle) => {
    r.style.setProperty(`--${k}-font`, ts.fontFamily);
    r.style.setProperty(`--${k}-size`, `${ts.fontSize}px`);
    r.style.setProperty(`--${k}-weight`, ts.bold ? "700" : "400");
    r.style.setProperty(`--${k}-style`, ts.italic ? "italic" : "normal");
    r.style.setProperty(`--${k}-deco`, ts.underline ? "underline" : "none");
  };
  set("wt-title", s.entryTitle);
  set("wt-section", s.entrySection);
  set("wt-body", s.entryBody);
  set("wt-tags", s.entryTags);
  set("wp-title", s.previewTitle);
  set("wp-section", s.previewSection);
  set("wp-body", s.previewBody);
  set("wp-tags", s.previewTags);
  r.style.setProperty("--wt-title-gap", `${s.entryTitleGap}px`);
  r.style.setProperty("--wt-section-gap", `${s.entrySectionGap}px`);
  r.style.setProperty("--wt-body-gap", `${s.entryBodyGap}px`);
  r.style.setProperty("--wt-tags-gap", `${s.entryTagsGap}px`);
  r.style.setProperty("--wp-title-gap", `${s.previewTitleGap}px`);
  r.style.setProperty("--wp-section-gap", `${s.previewSectionGap}px`);
  r.style.setProperty("--wp-body-gap", `${s.previewBodyGap}px`);
  r.style.setProperty("--wp-tags-gap", `${s.previewTagsGap}px`);
  r.style.setProperty("--wt-body-line-height", `${s.entryBodyLineHeight}`);
  r.style.setProperty("--wp-body-line-height", `${s.previewBodyLineHeight}`);
}
