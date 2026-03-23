import { useEffect, useState } from "react";

const STORAGE_KEY = "wiki-banner-url";
const DEFAULT_BANNER =
  "/assets/uploads/204351-678x450-Cottonwood-Tree-in-Autumn-1.jpg";

export function useBannerUrl(): [string, (url: string) => void] {
  const [bannerUrl, setBannerUrlState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? DEFAULT_BANNER,
  );

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setBannerUrlState(e.newValue ?? DEFAULT_BANNER);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setBannerUrl = (url: string) => {
    localStorage.setItem(STORAGE_KEY, url);
    setBannerUrlState(url);
  };

  return [bannerUrl, setBannerUrl];
}

export { DEFAULT_BANNER };
