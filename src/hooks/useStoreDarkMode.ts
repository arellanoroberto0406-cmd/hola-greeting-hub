import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "store-dark-mode";

function getSystemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function readSavedDark(): boolean | null {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === null) return null;
  return saved === "1";
}

export function useStoreDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return readSavedDark() ?? getSystemPrefersDark();
  });

  // Persist manual overrides; keep listening to system changes only while no override is saved.
  useEffect(() => {
    try {
      const saved = readSavedDark();
      if (saved === null) {
        window.localStorage.setItem(STORAGE_KEY, isDark ? "1" : "0");
      }
    } catch {
      /* ignore */
    }
  }, [isDark]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      if (readSavedDark() === null) {
        setIsDark(e.matches);
      }
    };
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const toggle = useCallback(() => {
    setIsDark((v) => {
      const next = !v;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { isDark, toggle, setIsDark };
}
