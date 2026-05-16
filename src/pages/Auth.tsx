import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, Store, Sparkles, ShoppingBag, CreditCard, BarChart3,
  CheckCircle2, ArrowRight, Zap, Star, Eye, EyeOff, Shield, 
  Globe, TrendingUp, Users, Rocket, Lock, Mail
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
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"signup" | "signin">("signup");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const features = [
    { icon: ShoppingBag, label: "Catálogo ilimitado", desc: "Sin límites de productos" },
    { icon: CreditCard, label: "Pagos integrados", desc: "PayPal, MP, transferencia" },
    { icon: BarChart3, label: "Analytics avanzados", desc: "Métricas en tiempo real" },
    { icon: Globe, label: "Dominio propio", desc: "Tienda profesional" },
    { icon: Shield, label: "100% Seguro", desc: "Datos siempre protegidos" },
    { icon: TrendingUp, label: "Sin límites", desc: "Escala tu negocio" },
  ];

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
            </div>
          </div>
          <p className="mt-4 text-muted-foreground text-sm">Cargando...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-background">
      {/* === ANIMATED BACKGROUND === */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
        <motion.div 
          className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-primary/8 rounded-full blur-[150px]"
          animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] bg-gold/6 rounded-full blur-[160px]"
          animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* === LEFT PANEL — STORE PREVIEW (desktop) === */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-8 xl:p-14"
      >
        <div className="max-w-xl w-full relative z-10 space-y-6">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center gap-3.5 cursor-pointer group"
            onClick={() => navigate("/inicio")}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-2xl scale-[2] group-hover:bg-primary/50 transition-all duration-500" />
              <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/70 flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:shadow-primary/60 transition-all duration-500 group-hover:scale-105">
                <Store className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <div>
              <span className="font-heading text-2xl font-bold tracking-tight">MiTienda</span>
              <span className="block text-xs text-muted-foreground/70 font-medium">Plataforma de e-commerce</span>
            </div>
          </motion.div>

          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="space-y-3"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary backdrop-blur-sm"
            >
              <Rocket className="h-3.5 w-3.5" />
              Prueba gratis por 14 días
            </motion.div>
            
            <h1 className="text-3xl xl:text-4xl font-bold font-heading leading-tight tracking-tight">
              Así se vería{" "}
              <span className="bg-gradient-to-r from-primary via-orange-400 to-gold bg-clip-text text-transparent">
                tu tienda online
              </span>
            </h1>
            
            <p className="text-base text-muted-foreground/80 leading-relaxed max-w-md">
              Diseño profesional, pagos integrados y gestión de pedidos. Todo listo para que empieces a vender.
            </p>
          </motion.div>

          {/* Store Preview Mockup */}
          <StorePreviewMockup viewMode={previewMode} onViewModeChange={setPreviewMode} />

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex items-center gap-8 pt-2"
          >
            {[
              { value: "500+", label: "Tiendas activas" },
              { value: "50K+", label: "Pedidos procesados" },
              { value: "99.9%", label: "Uptime" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-xl font-bold font-heading text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-gold text-gold" />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* === RIGHT PANEL — AUTH FORM === */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center px-5 py-8 md:px-12 lg:py-0 relative z-10 min-h-screen lg:min-h-0">
        <div className="w-full max-w-[440px]">
          {/* Mobile Header */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:hidden text-center mb-8"
          >
            <div 
              className="inline-flex items-center gap-2.5 cursor-pointer mb-5"
              onClick={() => navigate("/inicio")}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/25 blur-xl rounded-xl scale-[1.8]" />
                <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/30">
                  <Store className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <span className="font-heading text-xl font-bold tracking-tight">MiTienda</span>
            </div>
            
            <motion.h2 
              key={activeTab + "-mobile-title"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold font-heading"
            >
              {activeTab === "signup" ? "Crea tu tienda gratis" : "Bienvenido de vuelta"}
            </motion.h2>
            <p className="text-sm text-muted-foreground/70 mt-1.5 max-w-xs mx-auto">
              {activeTab === "signup" 
                ? "Únete a +500 emprendedores que ya venden online" 
                : "Inicia sesión para gestionar tu negocio"}
            </p>
          </motion.div>

          {/* Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-2xl shadow-2xl shadow-black/25 overflow-hidden relative"
          >
            {/* Subtle top accent line */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            {/* Desktop Card Header */}
            <div className="hidden lg:block px-8 pt-8 pb-2">
              <motion.h2
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold font-heading"
              >
                {activeTab === "signup" ? "Crear cuenta" : "Iniciar sesión"}
              </motion.h2>
              <motion.p 
                key={activeTab + "-desc"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground/70 mt-1"
              >
                {activeTab === "signup"
                  ? "Comienza tu prueba gratuita de 14 días"
                  : "Accede a tu panel de administración"}
              </motion.p>
            </div>

            {/* Tab Switcher */}
            <div className="px-6 md:px-8 pt-6 lg:pt-4">
              <div className="flex bg-muted/40 rounded-2xl p-1.5 gap-1">
                {(["signup", "signin"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setErrors({}); setShowForgotPassword(false); }}
                    className={`
                      flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 relative
                      ${activeTab === tab 
                        ? "text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground"}
                    `}
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="auth-tab-indicator"
                        className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 rounded-xl shadow-lg shadow-primary/25"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-1.5">
                      {tab === "signup" ? (
                        <><Zap className="h-3.5 w-3.5" />Registrarse</>
                      ) : (
                        <><ArrowRight className="h-3.5 w-3.5" />Iniciar sesión</>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Area */}
            <div className="px-6 md:px-8 pb-8 pt-6 relative">
              <AnimatePresence mode="wait">
                {activeTab === "signup" ? (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={handleSignUp}
                    className="space-y-5"
                  >
                    <FormField
                      id="signup-name"
                      label="Nombre completo"
                      icon={<Users className="h-4 w-4" />}
                      type="text"
                      placeholder="Tu nombre completo"
                      value={fullName}
                      onChange={setFullName}
                      error={errors.fullName}
                    />
                    <FormField
                      id="signup-email"
                      label="Correo electrónico"
                      icon={<Mail className="h-4 w-4" />}
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={setEmail}
                      error={errors.email}
                    />
                    <FormField
                      id="signup-password"
                      label="Contraseña"
                      icon={<Lock className="h-4 w-4" />}
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={setPassword}
                      error={errors.password}
                      showPasswordToggle
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                    />

                    <Button
                      type="submit"
                      className="w-full h-13 text-base gap-2.5 rounded-xl shadow-xl shadow-primary/30 font-bold mt-1 bg-gradient-to-r from-primary to-primary/90 hover:shadow-primary/40 transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Rocket className="h-4.5 w-4.5" />
                          Crear mi tienda gratis
                        </>
                      )}
                    </Button>

                    {/* Trust indicators */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {[
                        { icon: CheckCircle2, text: "Sin tarjeta" },
                        { icon: Sparkles, text: "14 días gratis" },
                        { icon: Shield, text: "100% seguro" },
                      ].map((item, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-muted/20 border border-border/20"
                        >
                          <item.icon className="h-4 w-4 text-primary/60" />
                          <span className="text-[10px] text-muted-foreground/70 font-semibold tracking-wide uppercase">{item.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signin"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={handleSignIn}
                    className="space-y-5"
                  >
                    <FormField
                      id="signin-email"
                      label="Correo electrónico"
                      icon={<Mail className="h-4 w-4" />}
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={setEmail}
                      error={errors.email}
                    />
                    <FormField
                      id="signin-password"
                      label="Contraseña"
                      icon={<Lock className="h-4 w-4" />}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={setPassword}
                      error={errors.password}
                      showPasswordToggle
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                    />

                    <Button
                      type="submit"
                      className="w-full h-13 text-base gap-2.5 rounded-xl shadow-xl shadow-primary/30 font-bold mt-1 bg-gradient-to-r from-primary to-primary/90 hover:shadow-primary/40 transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Acceder a mi tienda
                          <ArrowRight className="h-4.5 w-4.5" />
                        </>
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => { setShowForgotPassword(true); setResetEmailSent(false); }}
                      className="w-full text-center text-sm text-primary/80 hover:text-primary transition-colors pt-1 font-medium"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Forgot Password Overlay */}
              <AnimatePresence>
                {showForgotPassword && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-card/98 backdrop-blur-xl rounded-3xl z-20 flex flex-col items-center justify-center px-6 md:px-8"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full"
                    >
                      {resetEmailSent ? (
                        <div className="text-center space-y-5 w-full">
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center"
                          >
                            <CheckCircle2 className="h-8 w-8 text-primary" />
                          </motion.div>
                          <div>
                            <h3 className="text-xl font-bold font-heading">¡Email enviado!</h3>
                            <p className="text-sm text-muted-foreground/70 mt-2 leading-relaxed">
                              Revisa tu bandeja de entrada en <strong className="text-foreground">{email}</strong> y sigue las instrucciones.
                            </p>
                          </div>
                          <Button
                            onClick={() => { setShowForgotPassword(false); setResetEmailSent(false); }}
                            className="w-full h-12 rounded-xl font-semibold"
                          >
                            Volver al inicio de sesión
                          </Button>
                        </div>
                      ) : (
                        <form onSubmit={handleForgotPassword} className="w-full space-y-5">
                          <div className="text-center mb-2">
                            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mb-4">
                              <Shield className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold font-heading">Recuperar contraseña</h3>
                            <p className="text-sm text-muted-foreground/70 mt-1.5">
                              Te enviaremos un enlace de recuperación
                            </p>
                          </div>

                          <FormField
                            id="reset-email"
                            label="Correo electrónico"
                            icon={<Mail className="h-4 w-4" />}
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={setEmail}
                            error={errors.email}
                          />

                          <Button
                            type="submit"
                            className="w-full h-12 rounded-xl shadow-lg shadow-primary/25 font-semibold"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar enlace de recuperación"}
                          </Button>

                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(false)}
                            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors pt-1 font-medium"
                          >
                            ← Volver
                          </button>
                        </form>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Mobile Store Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:hidden mt-8"
          >
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
                <Sparkles className="h-3 w-3" />
                Vista previa
              </div>
              <h3 className="text-lg font-bold font-heading">
                Así se verá <span className="bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">tu tienda</span>
              </h3>
              <p className="text-xs text-muted-foreground/70 mt-1 px-4">
                Explora cada paso que vivirá tu cliente
              </p>
            </div>
            <StorePreviewMockup viewMode={previewMode} onViewModeChange={setPreviewMode} />
          </motion.div>

          {/* Bottom legal */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-[11px] text-muted-foreground/40 mt-6 leading-relaxed"
          >
            Al registrarte, aceptas nuestros términos de servicio y política de privacidad
          </motion.p>
        </div>
      </div>
    </div>
  );
};

/* ─── Reusable Form Field Component ─── */
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
  <div className="space-y-2">
    <Label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
      {label}
    </Label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary/70 transition-colors duration-200">
        {icon}
      </div>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-13 pl-11 ${showPasswordToggle ? 'pr-12' : ''} bg-background/40 border-border/40 focus:border-primary/40 focus:bg-background/60 rounded-xl transition-all duration-300 text-sm placeholder:text-muted-foreground/40`}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-xs text-destructive font-medium"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

export default Auth;
