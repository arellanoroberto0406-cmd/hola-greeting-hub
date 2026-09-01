import { useEffect, useState } from "react";
import type { AccentPalette } from "@/types/storeLayout";

const ACCENT_STORAGE_KEY = "store-accent-palette";
const VALID: AccentPalette[] = ["champagne", "coral", "esmeralda", "zafiro", "lavanda"];

function isValid(value: string | null): value is AccentPalette {
  return !!value && (VALID as string[]).includes(value);
}

/**
 * Mantiene la paleta de acentos sincronizada entre pestañas.
 * Recibe la paleta local (de la BD) y devuelve la que debe aplicarse,
 * escuchando el evento `storage` para reaccionar en tiempo real.
 */
export function useStoreAccentSync(palette: AccentPalette | undefined) {
  const current = palette ?? "champagne";
  const [synced, setSynced] = useState<AccentPalette>(current);

  // Cuando cambia localmente, persistimos y notificamos a otras pestañas.
  useEffect(() => {
    setSynced(current);
    try {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, current);
    } catch {
      /* ignore */
    }
  }, [current]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== ACCENT_STORAGE_KEY) return;
      if (isValid(e.newValue)) setSynced(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return synced;
}
