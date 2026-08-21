import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "store-dark-mode";

export type ThemeMode = "light" | "dark" | "auto";

function getSystemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function readSavedMode(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === null) return null;
  // Legacy boolean values + new named values
  if (saved === "auto") return "auto";
  if (saved === "dark" || saved === "1") return "dark";
  if (saved === "light" || saved === "0") return "light";
  return null;
}

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === "auto") return getSystemPrefersDark();
  return mode === "dark";
}

export function useStoreDarkMode() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "auto";
    return readSavedMode() ?? "auto";
  });

  const [isDark, setIsDark] = useState<boolean>(() => resolveIsDark(mode));

  // Keep the resolved value in sync whenever the mode changes.
  useEffect(() => {
    setIsDark(resolveIsDark(mode));
  }, [mode]);

  // Persist the mode. When "auto" is selected, remove the stored key so the
  // browser follows `prefers-color-scheme` again and future visits start fresh.
  useEffect(() => {
    try {
      if (mode === "auto") {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, mode);
      }
    } catch {
      /* ignore */
    }
  }, [mode]);

  // Listen to system preference changes and update the resolved value while
  // the mode is set to "auto".
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      if (mode === "auto") {
        setIsDark(e.matches);
      }
    };
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [mode]);

  const setModeAndResolve = useCallback((next: ThemeMode) => {
    setMode(next);
  }, []);

  // Cycles through Light → Dark → Auto → Light.
  const cycle = useCallback(() => {
    setMode((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "auto";
      return "light";
    });
  }, []);

  const toggle = useCallback(() => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  return { mode, isDark, setMode: setModeAndResolve, cycle, toggle };
}
