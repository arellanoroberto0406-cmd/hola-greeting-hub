import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "store-dark-mode";

export function useStoreDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, isDark ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [isDark]);

  const toggle = useCallback(() => setIsDark((v) => !v), []);

  return { isDark, toggle, setIsDark };
}
