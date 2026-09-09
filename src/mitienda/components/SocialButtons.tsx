import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.6-.2-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.8c2.2-2 3.7-5 3.7-8.8z" />
    <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.8-2.9l-3.7-2.8c-1 .7-2.3 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5l-3.9 3C3.3 21.3 7.3 24 12 24z" />
    <path fill="#FBBC05" d="M5.3 14.5c-.2-.7-.4-1.4-.4-2.5s.1-1.7.4-2.5l-3.9-3C.5 8.2 0 10 0 12s.5 3.8 1.4 5.5l3.9-3z" />
    <path fill="#EA4335" d="M12 4.8c2.2 0 3.7.9 4.6 1.7l3.3-3.2C17.9 1.3 15.2 0 12 0 7.3 0 3.3 2.7 1.4 6.5l3.9 3c.9-2.8 3.6-4.7 6.7-4.7z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
    <path d="M16.4 12.8c0-2.6 2.1-3.9 2.2-4-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9s-2-.9-3.3-.9C5.9 6.8 4.3 7.8 3.4 9.4c-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.3.8 2.2-1.2 3.1-2.5c1-1.4 1.4-2.8 1.4-2.9-.1 0-2.6-1-2.6-4zM14 4.9c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3.1 1.6-.7.8-1.2 2-1.1 3.2 1.1.1 2.3-.6 3.1-1.5z" />
  </svg>
);

const soon = (name: string) =>
  toast({ title: `${name} disponible pronto`, description: "Por ahora usa Google o tu correo electrónico." });

export const googleSignIn = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/mitienda/crear` },
  });
  if (error) toast({ title: "No se pudo continuar con Google", description: error.message, variant: "destructive" });
};

const SocialButtons = ({ mode = "login", layout = "stack" }: { mode?: "login" | "signup"; layout?: "stack" | "row" }) => {
  const verb = mode === "login" ? "Continuar con" : "Registrarme con";
  return (
    <div className={layout === "row" ? "grid gap-3 sm:grid-cols-2" : "grid gap-3"}>
      <button type="button" className="mt-btn mt-btn-ghost w-full" onClick={googleSignIn}>
        <GoogleIcon /> {verb} Google
      </button>
      <button type="button" className="mt-btn mt-btn-ghost w-full" onClick={() => soon("Apple")}>
        <AppleIcon /> {verb} Apple
      </button>
    </div>
  );
};

export default SocialButtons;
