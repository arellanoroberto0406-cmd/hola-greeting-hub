import { useEffect, useMemo, useState } from "react";
import type { AccentPalette } from "@/types/storeLayout";

const BASE_KEY = "store-accent-palette";
const VALID: AccentPalette[] = ["champagne", "coral", "esmeralda", "zafiro", "lavanda"];

function isValid(value: string | null): value is AccentPalette {
  return !!value && (VALID as string[]).includes(value);
}

function buildKey(scope?: string) {
  return scope ? `${BASE_KEY}:${scope}` : BASE_KEY;
}

/**
 * Mantiene la paleta de acentos sincronizada entre pestañas, por tienda.
 * @param palette paleta guardada en la base de datos (fuente de verdad)
 * @param scope identificador de la tienda (slug o id)
 */
export function useStoreAccentSync(palette: AccentPalette | undefined, scope?: string) {
  const key = useMemo(() => buildKey(scope), [scope]);
  const current = palette ?? "champagne";
  const [synced, setSynced] = useState<AccentPalette>(current);

  useEffect(() => {
    setSynced(current);
    try {
      window.localStorage.setItem(key, current);
    } catch {
      /* ignore */
    }
  }, [current, key]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      if (isValid(e.newValue)) setSynced(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  return synced;
}
