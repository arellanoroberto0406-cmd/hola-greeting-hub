import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeMode } from "@/hooks/useStoreDarkMode";

interface Props {
  mode: ThemeMode;
  isDark: boolean;
  onCycle: () => void;
  className?: string;
  label?: boolean;
}

type ModeConfig = {
  icon: React.ElementType;
  label: string;
  aria: string;
  title: string;
};

const config: Record<ThemeMode, ModeConfig> = {
  light: {
    icon: Sun,
    label: "Claro",
    aria: "Modo claro activo. Cambiar a modo oscuro.",
    title: "Modo claro",
  },
  dark: {
    icon: Moon,
    label: "Oscuro",
    aria: "Modo oscuro activo. Cambiar a modo automático.",
    title: "Modo oscuro",
  },
  auto: {
    icon: Monitor,
    label: "Auto",
    aria: "Modo automático activo. Sigue la preferencia del sistema. Cambiar a modo claro.",
    title: "Automático (sigue el sistema)",
  },
};

/**
 * Elegant Bento Prestige dark-mode toggle.
 * Fixed floating pill by default; pass className to override positioning.
 * Cycles through Light → Dark → Auto.
 */
const StoreDarkModeToggle = ({ mode, isDark, onCycle, className, label = false }: Props) => {
  const { icon: Icon, label: text, aria, title } = config[mode];

  return (
    <Button
      type="button"
      onClick={onCycle}
      variant="outline"
      size="sm"
      aria-pressed={mode !== "auto" ? isDark : undefined}
      aria-label={aria}
      title={title}
      className={cn(
        "group gap-2 rounded-full border-2 backdrop-blur-xl shadow-lg transition-all duration-500",
        "hover:scale-105 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-offset-2",
        isDark
          ? "bg-neutral-900/70 border-amber-400/40 text-amber-100 hover:bg-neutral-800/80"
          : "bg-white/70 border-neutral-900/10 text-neutral-900 hover:bg-white/90",
        className,
      )}
    >
      <Icon className="h-4 w-4" />
      {label && (
        <span className="text-xs font-medium tracking-wide uppercase">
          {text}
        </span>
      )}
    </Button>
  );
};

export default StoreDarkModeToggle;
