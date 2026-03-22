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
  // Entry view spacing (px)
  entryTitleToSectionGap: number;
  entrySectionToBodyGap: number;
  // Preview card spacing (px)
  previewTitleToSectionGap: number;
  previewSectionToBodyGap: number;
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
  entryTitleToSectionGap: 24,
  entrySectionToBodyGap: 8,
  previewTitleToSectionGap: 8,
  previewSectionToBodyGap: 4,
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
  r.style.setProperty(
    "--wt-title-section-gap",
    `${s.entryTitleToSectionGap}px`,
  );
  r.style.setProperty("--wt-section-body-gap", `${s.entrySectionToBodyGap}px`);
  r.style.setProperty(
    "--wp-title-section-gap",
    `${s.previewTitleToSectionGap}px`,
  );
  r.style.setProperty(
    "--wp-section-body-gap",
    `${s.previewSectionToBodyGap}px`,
  );
}
