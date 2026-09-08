import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Store, Sparkles, CheckCircle2, ArrowRight,
  Eye, EyeOff, Shield, CreditCard, Gift, Lock, Mail, User, ArrowLeft,
} from "lucide-react";
import { signInSchema, signUpSchema } from "@/lib/validation";
import { StorePreviewMockup } from "@/components/StorePreviewMockup";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, signIn, signUp, resetPasswordForEmail } = useAuth();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"signup" | "signin">("signin");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const redirectTo = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    if (!loading && user) navigate(redirectTo);
  }, [user, loading, navigate, redirectTo]);

  const validateForm = (isSignUp = false) => {
    const newErrors: { email?: string; password?: string; fullName?: string } = {};
    const schema = isSignUp ? signUpSchema : signInSchema;
    const result = schema.safeParse({ email, password, ...(isSignUp ? { fullName: fullName || "" } : {}) });
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (field === "email") newErrors.email = issue.message;
        if (field === "password") newErrors.password = issue.message;
        if (field === "fullName") newErrors.fullName = issue.message;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: error.message === "Invalid login credentials"
          ? "Credenciales inválidas. Verifica tu email y contraseña."
          : error.message,
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    setIsSubmitting(true);
    const { error } = await signUp(email, password, fullName);
    setIsSubmitting(false);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error al registrarse",
        description: error.message.includes("already registered")
          ? "Este email ya está registrado. Intenta iniciar sesión."
          : error.message,
      });
    } else {
      toast({ title: "¡Cuenta creada!", description: "Tu cuenta ha sido creada exitosamente." });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setErrors({ email: "Ingresa tu email" }); return; }
    setIsSubmitting(true);
    const { error } = await resetPasswordForEmail(email);
    setIsSubmitting(false);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setResetEmailSent(true);
    }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      toast({ variant: "destructive", title: "No se pudo continuar con Google", description: error.message });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center auth-canvas">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
            <div className="relative w-16 h-16 rounded-[1.4rem] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
            </div>
          </div>
          <p className="mt-4 text-muted-foreground text-sm">Cargando...</p>
        </motion.div>
      </div>
    );
  }

  const isSignup = activeTab === "signup";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden auth-canvas">
      {/* Soft pastel blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-[18%] -left-[12%] w-[560px] h-[560px] rounded-full blur-[150px]"
          style={{ background: "hsl(var(--primary) / 0.16)" }}
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-[22%] -right-[10%] w-[520px] h-[520px] rounded-full blur-[160px]"
          style={{ background: "hsl(265 80% 70% / 0.14)" }}
          animate={{ x: [0, -45, 0], y: [0, -30, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        <div className="absolute top-1/3 right-1/4 w-[320px] h-[320px] rounded-full blur-[140px]" style={{ background: "hsl(200 90% 70% / 0.10)" }} />
      </div>

      {/* === LEFT: PREVIEW (desktop) === */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-[52%] relative items-center justify-center p-10 xl:p-16"
      >
        <div className="max-w-xl w-full relative z-10 space-y-7">
          <Brand onClick={() => navigate("/inicio")} size="lg" />

          <div className="space-y-3">
            <h1 className="text-4xl xl:text-[2.75rem] font-bold font-heading leading-[1.1] tracking-tight">
              Crea tu tienda{" "}
              <span className="text-primary">en minutos</span>
            </h1>
            <p className="text-base text-muted-foreground/80 leading-relaxed max-w-md">
              Productos que inspiran, pagos integrados y tu marca en un enlace propio. Todo listo para vender.
            </p>
          </div>

          <StorePreviewMockup viewMode={previewMode} onViewModeChange={setPreviewMode} />

          <TrustRow />
        </div>
      </motion.div>

      {/* === RIGHT: AUTH CARD === */}
      <div className="w-full lg:w-[48%] flex flex-col items-center justify-center px-5 py-10 md:px-12 relative z-10">
        <div className="w-full max-w-[430px]">
          {/* Mobile brand */}
          <div className="lg:hidden flex justify-center mb-6">
            <Brand onClick={() => navigate("/inicio")} size="sm" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[2rem] bg-card/85 backdrop-blur-xl border border-border/50 shadow-[0_30px_80px_-40px_hsl(var(--primary)/0.45)] px-6 md:px-8 py-8"
          >
            {/* Heading */}
            <div className="text-center mb-6">
              <motion.h2
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[1.75rem] font-bold font-heading tracking-tight"
              >
                {isSignup ? "Crea tu cuenta" : "Bienvenido de vuelta"}
              </motion.h2>
              <p className="text-sm text-muted-foreground/75 mt-1.5">
                {isSignup ? "Empieza tu tienda gratis en minutos" : "Ingresa a tu cuenta para continuar"}
              </p>
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                {isSignup ? (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={handleSignUp}
                    className="space-y-4"
                  >
                    <FormField id="signup-name" label="Nombre completo" icon={<User className="h-4 w-4" />} type="text"
                      placeholder="Tu nombre" value={fullName} onChange={setFullName} error={errors.fullName} />
                    <FormField id="signup-email" label="Correo electrónico" icon={<Mail className="h-4 w-4" />} type="email"
                      placeholder="tu@email.com" value={email} onChange={setEmail} error={errors.email} />
                    <FormField id="signup-password" label="Contraseña" icon={<Lock className="h-4 w-4" />}
                      type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={password}
                      onChange={setPassword} error={errors.password} showPasswordToggle showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)} />

                    <SubmitButton loading={isSubmitting} label="Crear cuenta" />
                  </motion.form>
                ) : (
                  <motion.form
                    key="signin"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={handleSignIn}
                    className="space-y-4"
                  >
                    <FormField id="signin-email" label="Correo electrónico" icon={<Mail className="h-4 w-4" />} type="email"
                      placeholder="tu@email.com" value={email} onChange={setEmail} error={errors.email} />
                    <FormField id="signin-password" label="Contraseña" icon={<Lock className="h-4 w-4" />}
                      type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                      onChange={setPassword} error={errors.password} showPasswordToggle showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)} />

                    <div className="flex items-center justify-between pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} className="rounded-[6px] data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                        <span className="text-sm text-muted-foreground">Recordarme</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => { setShowForgotPassword(true); setResetEmailSent(false); }}
                        className="text-sm font-medium text-primary hover:underline underline-offset-4"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>

                    <SubmitButton loading={isSubmitting} label="Entrar" />
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="h-px flex-1 bg-border/70" />
                <span className="text-xs text-muted-foreground/70">o continúa con</span>
                <div className="h-px flex-1 bg-border/70" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                className="w-full h-14 rounded-2xl border border-border/70 bg-background/70 hover:bg-background hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 font-semibold text-sm shadow-sm"
              >
                <GoogleIcon />
                Google
              </button>

              <p className="text-center text-sm text-muted-foreground mt-6">
                {isSignup ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
                <button
                  type="button"
                  onClick={() => { setActiveTab(isSignup ? "signin" : "signup"); setErrors({}); setShowForgotPassword(false); }}
                  className="font-semibold text-primary hover:underline underline-offset-4"
                >
                  {isSignup ? "Iniciar sesión" : "Crear cuenta"}
                </button>
              </p>

              {/* Forgot Password Overlay */}
              <AnimatePresence>
                {showForgotPassword && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -inset-2 bg-card/97 backdrop-blur-xl rounded-[1.75rem] z-20 flex flex-col items-center justify-center px-4"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 16, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 16, scale: 0.97 }}
                      transition={{ duration: 0.28 }}
                      className="w-full"
                    >
                      {resetEmailSent ? (
                        <div className="text-center space-y-5 w-full">
                          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold font-heading">¡Email enviado!</h3>
                            <p className="text-sm text-muted-foreground/75 mt-2 leading-relaxed">
                              Revisa tu bandeja de entrada en <strong className="text-foreground">{email}</strong>.
                            </p>
                          </div>
                          <Button onClick={() => { setShowForgotPassword(false); setResetEmailSent(false); }} className="w-full h-12 rounded-2xl font-semibold">
                            Volver al inicio de sesión
                          </Button>
                        </div>
                      ) : (
                        <form onSubmit={handleForgotPassword} className="w-full space-y-5">
                          <div className="text-center">
                            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                              <Shield className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold font-heading">Recuperar contraseña</h3>
                            <p className="text-sm text-muted-foreground/75 mt-1.5">Te enviaremos un enlace de recuperación</p>
                          </div>
                          <FormField id="reset-email" label="Correo electrónico" icon={<Mail className="h-4 w-4" />} type="email"
                            placeholder="tu@email.com" value={email} onChange={setEmail} error={errors.email} />
                          <Button type="submit" className="w-full h-12 rounded-2xl font-semibold shadow-lg shadow-primary/25" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar enlace"}
                          </Button>
                          <button type="button" onClick={() => setShowForgotPassword(false)}
                            className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                            <ArrowLeft className="h-3.5 w-3.5" /> Volver
                          </button>
                        </form>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Trust row (mobile) */}
          <div className="lg:hidden mt-7">
            <TrustRow />
          </div>

          {/* Mobile preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:hidden mt-8"
          >
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
                <Sparkles className="h-3 w-3" /> Vista previa
              </div>
              <h3 className="text-lg font-bold font-heading">
                Así se verá <span className="text-primary">tu tienda</span>
              </h3>
            </div>
            <StorePreviewMockup viewMode={previewMode} onViewModeChange={setPreviewMode} />
          </motion.div>

          <p className="text-center text-[11px] text-muted-foreground/50 mt-7 leading-relaxed">
            Al continuar, aceptas nuestros términos de servicio y política de privacidad
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─── Brand ─── */
const Brand = ({ onClick, size = "sm" }: { onClick?: () => void; size?: "sm" | "lg" }) => {
  const big = size === "lg";
  return (
    <div className="inline-flex items-center gap-3 cursor-pointer group" onClick={onClick}>
      <div className="relative">
        <div className="absolute inset-0 bg-primary/30 blur-xl rounded-2xl scale-150 group-hover:bg-primary/45 transition-colors duration-500" />
        <div className={`relative ${big ? "h-14 w-14" : "h-11 w-11"} rounded-[1.1rem] bg-gradient-to-br from-primary to-primary/75 flex items-center justify-center shadow-xl shadow-primary/35 group-hover:scale-105 transition-transform duration-500`}>
          <Store className={big ? "h-7 w-7 text-primary-foreground" : "h-5.5 w-5.5 text-primary-foreground"} />
        </div>
      </div>
      <div>
        <span className={`${big ? "text-3xl" : "text-xl"} font-heading font-bold tracking-tight block leading-none`}>APP TIENDA</span>
        <span className="text-[11px] text-muted-foreground/70 font-medium">Tu negocio, más cerca de todos</span>
      </div>
    </div>
  );
};

/* ─── Trust row ─── */
const TrustRow = () => (
  <div className="grid grid-cols-3 gap-3">
    {[
      { icon: CreditCard, text: "Sin tarjeta" },
      { icon: Gift, text: "14 días gratis" },
      { icon: Shield, text: "100% seguro" },
    ].map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 + i * 0.08 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="h-11 w-11 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center">
          <item.icon className="h-[18px] w-[18px] text-primary" />
        </div>
        <span className="text-[11px] text-muted-foreground/80 font-medium">{item.text}</span>
      </motion.div>
    ))}
  </div>
);

/* ─── Submit button ─── */
const SubmitButton = ({ loading, label }: { loading: boolean; label: string }) => (
  <Button
    type="submit"
    disabled={loading}
    className="w-full h-14 mt-2 rounded-2xl text-base font-semibold gap-2 bg-primary hover:bg-primary shadow-[0_14px_30px_-12px_hsl(var(--primary)/0.8)] hover:shadow-[0_18px_38px_-12px_hsl(var(--primary)/0.9)] hover:-translate-y-0.5 active:scale-[0.985] transition-all duration-300"
  >
    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (<>{label}<ArrowRight className="h-4 w-4" /></>)}
  </Button>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C39.9 35.6 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z" />
  </svg>
);

/* ─── Reusable Form Field ─── */
interface FormFieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const FormField = ({ id, label, icon, type, placeholder, value, onChange, error, showPasswordToggle, showPassword, onTogglePassword }: FormFieldProps) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-sm font-medium text-foreground/80">{label}</Label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors duration-200">
        {icon}
      </div>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-14 pl-11 ${showPasswordToggle ? "pr-12" : ""} bg-background/70 border-border/60 rounded-2xl text-sm placeholder:text-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-primary/25 focus:border-primary/50 transition-all duration-300 group-focus-within:shadow-lg group-focus-within:shadow-primary/10`}
      />
      {showPasswordToggle && (
        <button type="button" onClick={onTogglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors">
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          className="text-xs text-destructive font-medium">{error}</motion.p>
      )}
    </AnimatePresence>
  </div>
);

export default Auth;
