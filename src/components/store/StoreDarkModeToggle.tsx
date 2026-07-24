import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
  label?: boolean;
}

/**
 * Elegant Bento Prestige dark-mode toggle.
 * Fixed floating pill by default; pass className to override positioning.
 */
const StoreDarkModeToggle = ({ isDark, onToggle, className, label = false }: Props) => {
  return (
    <Button
      type="button"
      onClick={onToggle}
      variant="outline"
      size="sm"
      aria-pressed={isDark}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className={cn(
        "group gap-2 rounded-full border-2 backdrop-blur-xl shadow-lg transition-all duration-500",
        "hover:scale-105 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-offset-2",
        isDark
          ? "bg-neutral-900/70 border-amber-400/40 text-amber-100 hover:bg-neutral-800/80"
          : "bg-white/70 border-neutral-900/10 text-neutral-900 hover:bg-white/90",
        className,
      )}
    >
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        <Sun
          className={cn(
            "absolute h-4 w-4 transition-all duration-500",
            isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100",
          )}
        />
        <Moon
          className={cn(
            "absolute h-4 w-4 transition-all duration-500",
            isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50",
          )}
        />
      </span>
      {label && (
        <span className="text-xs font-medium tracking-wide uppercase">
          {isDark ? "Oscuro" : "Claro"}
        </span>
      )}
    </Button>
  );
};

export default StoreDarkModeToggle;
