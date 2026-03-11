import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  Store, 
  Sparkles, 
  ShoppingBag, 
  CreditCard, 
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  Star,
  Eye,
  EyeOff,
  Shield,
  Globe,
  TrendingUp,
  Users
} from "lucide-react";
import { signInSchema, signUpSchema } from "@/lib/validation";

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
  
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const features = [
    { icon: ShoppingBag, label: "Catálogo ilimitado", desc: "Sin límite de productos" },
    { icon: CreditCard, label: "Pagos integrados", desc: "PayPal, MercadoPago, transferencia" },
    { icon: BarChart3, label: "Analytics avanzados", desc: "Métricas en tiempo real" },
    { icon: Globe, label: "Tu propio dominio", desc: "Tienda profesional" },
    { icon: Shield, label: "100% Seguro", desc: "Datos protegidos siempre" },
    { icon: TrendingUp, label: "Crece sin límites", desc: "Escala tu negocio" },
  ];

  const stats = [
    { value: "500+", label: "Tiendas activas" },
    { value: "50K+", label: "Pedidos procesados" },
    { value: "99.9%", label: "Uptime garantizado" },
  ];

  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo);
    }
  }, [user, loading, navigate, redirectTo]);

  const validateForm = (isSignUp = false) => {
    const newErrors: { email?: string; password?: string; fullName?: string } = {};
    const schema = isSignUp ? signUpSchema : signInSchema;
    const result = schema.safeParse({ 
      email, password,
      ...(isSignUp ? { fullName: fullName || "" } : {})
    });
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
      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta ha sido creada exitosamente.",
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: "Ingresa tu email" });
      return;
    }
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
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-background">
      {/* === ANIMATED BACKGROUND === */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,hsl(var(--primary)/0.15),transparent)]" />
        <motion.div 
          className="absolute top-[10%] left-[5%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[120px]"
          animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-gold/8 rounded-full blur-[140px]"
          animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.04)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* === LEFT PANEL — BRANDING (desktop only) === */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative items-center justify-center p-8 xl:p-16"
      >
        <div className="max-w-xl w-full relative z-10 space-y-10">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/inicio")}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 blur-2xl rounded-2xl scale-150 group-hover:bg-primary/60 transition-colors" />
              <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/30">
                <Store className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <div>
              <span className="font-heading text-2xl font-bold tracking-tight">MiTienda</span>
              <span className="block text-xs text-muted-foreground -mt-0.5">Plataforma de comercio</span>
            </div>
          </motion.div>

          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Prueba gratis por 14 días
            </div>
            <h1 className="text-4xl xl:text-[3.2rem] font-bold font-heading leading-[1.1] tracking-tight">
              Tu tienda online,{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-primary via-orange-400 to-gold bg-clip-text text-transparent">
                  lista en minutos
                </span>
                <motion.span 
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-gold rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  style={{ originX: 0 }}
                />
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              Sin código. Sin complicaciones. Crea, personaliza y vende con la plataforma más intuitiva del mercado.
            </p>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-3"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-card/40 border border-border/40 backdrop-blur-sm hover:bg-card/60 hover:border-primary/20 transition-all duration-300 group/item"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover/item:bg-primary/20 transition-colors">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">{f.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex items-center gap-8 pt-2"
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold font-heading bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
            <div className="flex items-center gap-1 ml-auto">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* === RIGHT PANEL — AUTH FORM === */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-[48%] xl:w-[45%] flex flex-col items-center justify-center px-5 py-8 md:px-10 lg:py-0 relative z-10"
      >
        <div className="w-full max-w-[420px]">
          {/* Mobile Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden text-center mb-6"
          >
            <div 
              className="inline-flex items-center gap-2.5 cursor-pointer mb-4"
              onClick={() => navigate("/inicio")}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-xl scale-150" />
                <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Store className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <span className="font-heading text-lg font-bold tracking-tight">MiTienda</span>
            </div>
            <h2 className="text-xl font-bold font-heading">
              {activeTab === "signup" ? "Crea tu tienda gratis" : "Bienvenido de vuelta"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === "signup" 
                ? "Únete a +500 emprendedores exitosos" 
                : "Inicia sesión para gestionar tu tienda"}
            </p>
          </motion.div>

          {/* Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-2xl shadow-2xl shadow-black/20 overflow-hidden"
          >
            {/* Desktop Card Header */}
            <div className="hidden lg:block px-7 pt-7 pb-4">
              <motion.h2
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold font-heading"
              >
                {activeTab === "signup" ? "Crear cuenta" : "Iniciar sesión"}
              </motion.h2>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === "signup"
                  ? "Comienza tu prueba gratuita de 14 días"
                  : "Accede a tu panel de administración"}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="px-7 pt-5 lg:pt-0">
              <div className="flex bg-muted/50 rounded-xl p-1 gap-1">
                {(["signup", "signin"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setErrors({}); }}
                    className={`
                      flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 relative
                      ${activeTab === tab 
                        ? "text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground"}
                    `}
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="auth-tab"
                        className="absolute inset-0 bg-primary rounded-lg shadow-md shadow-primary/20"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">
                      {tab === "signup" ? "Registrarse" : "Iniciar sesión"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="px-7 pb-7 pt-5">
              <AnimatePresence mode="wait">
                {activeTab === "signup" ? (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleSignUp}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Nombre completo
                      </Label>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Tu nombre"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="h-12 pl-10 bg-background/50 border-border/60 focus:border-primary/50 rounded-xl transition-colors"
                        />
                      </div>
                      {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="signup-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Email
                      </Label>
                      <div className="relative">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 pl-10 bg-background/50 border-border/60 focus:border-primary/50 rounded-xl transition-colors"
                        />
                      </div>
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="signup-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 pl-10 pr-11 bg-background/50 border-border/60 focus:border-primary/50 rounded-xl transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base gap-2 rounded-xl shadow-lg shadow-primary/25 font-semibold mt-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
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
                        <div key={i} className="flex flex-col items-center gap-1 py-2 rounded-lg bg-muted/30 border border-border/30">
                          <item.icon className="h-3.5 w-3.5 text-primary/70" />
                          <span className="text-[10px] text-muted-foreground font-medium">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signin"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleSignIn}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="signin-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Email
                      </Label>
                      <div className="relative">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 pl-10 bg-background/50 border-border/60 focus:border-primary/50 rounded-xl transition-colors"
                        />
                      </div>
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="signin-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 pl-10 pr-11 bg-background/50 border-border/60 focus:border-primary/50 rounded-xl transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base gap-2 rounded-xl shadow-lg shadow-primary/25 font-semibold mt-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Iniciar sesión
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => { setShowForgotPassword(true); setResetEmailSent(false); }}
                      className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors pt-1"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Mobile Feature Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:hidden flex flex-wrap justify-center gap-2 mt-5"
          >
            {[
              { icon: ShoppingBag, text: "Productos ilimitados" },
              { icon: CreditCard, text: "Pagos seguros" },
              { icon: BarChart3, text: "Analytics" },
            ].map((chip, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-border/40 text-xs text-muted-foreground backdrop-blur-sm">
                <chip.icon className="h-3 w-3 text-primary/60" />
                {chip.text}
              </span>
            ))}
          </motion.div>

          {/* Bottom */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-muted-foreground/60 mt-5"
          >
            Al registrarte, aceptas nuestros términos de servicio y política de privacidad
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
