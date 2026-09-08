import { useCallback, useEffect, useMemo, useState } from "react";

const BASE_KEY = "store-dark-mode";

export type ThemeMode = "light" | "dark" | "auto";

function buildKey(scope?: string) {
  return scope ? `${BASE_KEY}:${scope}` : BASE_KEY;
}

function getSystemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function parseMode(saved: string | null): ThemeMode | null {
  if (saved === null) return null;
  if (saved === "auto") return "auto";
  if (saved === "dark" || saved === "1") return "dark";
  if (saved === "light" || saved === "0") return "light";
  return null;
}

function readSavedMode(key: string): ThemeMode | null {
  if (typeof window === "undefined") return null;
  return parseMode(window.localStorage.getItem(key));
}

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === "auto") return getSystemPrefersDark();
  return mode === "dark";
}

/**
 * Tema por tienda/entorno.
 * @param scope identificador de la tienda (slug o id). Si se omite, el tema es global.
 * @param defaultMode modo por defecto de la tienda (por ejemplo `stores.default_theme`).
 */
export function useStoreDarkMode(scope?: string, defaultMode: ThemeMode = "auto") {
  const key = useMemo(() => buildKey(scope), [scope]);

  const [mode, setMode] = useState<ThemeMode>(() => readSavedMode(buildKey(scope)) ?? defaultMode);
  const [isDark, setIsDark] = useState<boolean>(() => resolveIsDark(mode));

  // Al cambiar de tienda (o al conocer su tema por defecto), recargamos su preferencia.
  useEffect(() => {
    setMode(readSavedMode(key) ?? defaultMode);
  }, [key, defaultMode]);

  useEffect(() => {
    setIsDark(resolveIsDark(mode));
  }, [mode]);

  useEffect(() => {
    try {
      if (mode === "auto") {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, mode);
      }
    } catch {
      /* ignore */
    }
  }, [mode, key]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      if (mode === "auto") setIsDark(e.matches);
    };
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [mode]);

  // Sincroniza entre pestañas, solo para la misma tienda.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key && e.key !== null) return;
      const next = readSavedMode(key) ?? defaultMode;
      setMode((prev) => (prev === next ? prev : next));
      setIsDark(resolveIsDark(next));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, defaultMode]);

  const setModeAndResolve = useCallback((next: ThemeMode) => {
    setMode(next);
  }, []);

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
