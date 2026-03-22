import {
  type TypographySettings,
  applySettingsToDom,
  loadSettings,
  saveSettings,
} from "@/lib/typography";
import { createContext, useContext, useState } from "react";

interface TypographyContextValue {
  settings: TypographySettings;
  applyAndSave: (s: TypographySettings) => void;
}

const TypographyContext = createContext<TypographyContextValue | null>(null);

function initSettings(): TypographySettings {
  const s = loadSettings();
  applySettingsToDom(s);
  return s;
}

export function TypographyProvider({
  children,
}: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<TypographySettings>(initSettings);

  const applyAndSave = (s: TypographySettings) => {
    saveSettings(s);
    applySettingsToDom(s);
    setSettings(s);
  };

  return (
    <TypographyContext.Provider value={{ settings, applyAndSave }}>
      {children}
    </TypographyContext.Provider>
  );
}

export function useTypography() {
  const ctx = useContext(TypographyContext);
  if (!ctx)
    throw new Error("useTypography must be used inside TypographyProvider");
  return ctx;
}
