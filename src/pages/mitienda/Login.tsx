import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Eye, EyeOff, Heart, Loader2, Lock, Mail, Sparkles, Zap } from "lucide-react";
import "@/mitienda/mitienda.css";
import MtNav from "@/mitienda/components/MtNav";
import SocialButtons from "@/mitienda/components/SocialButtons";
import StoreMock from "@/mitienda/components/StoreMock";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { EMPTY_DRAFT } from "@/mitienda/draft";

const PERKS = [
  { icon: Zap, title: "Fácil de usar", text: "Sin código, sin complicaciones. Tu tienda lista en minutos." },
  { icon: BarChart3, title: "Haz crecer tu negocio", text: "Herramientas para vender más y llegar más lejos." },
  { icon: Heart, title: "Cuentas con nosotros", text: "Soporte real de personas que entienden tu negocio." },
];

const Login = () => {
  const navigate = useNavigate();
  const { signIn, resetPasswordForEmail } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const demo = { ...EMPTY_DRAFT, name: "LunaStore", categories: ["hogar", "belleza"] };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      toast({ title: "Faltan datos", description: "Escribe tu correo y tu contraseña.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      toast({ title: "No pudimos entrar", description: "Revisa tu correo y contraseña e inténtalo de nuevo.", variant: "destructive" });
      return;
    }
    toast({ title: "¡Bienvenido de vuelta!" });
    navigate("/mitienda/panel");
  };

  const handleForgot = async () => {
    if (!email.trim()) {
      toast({ title: "Escribe tu correo", description: "Lo necesitamos para enviarte el enlace.", variant: "destructive" });
      return;
    }
    const { error } = await resetPasswordForEmail(email.trim());
    toast({
      title: error ? "No se pudo enviar" : "Revisa tu correo",
      description: error ? error.message : "Te enviamos un enlace para crear una contraseña nueva.",
      variant: error ? "destructive" : undefined,
    });
  };

  return (
    <div className="mt mt-shell">
      <MtNav variant="minimal" />
      <main className="mx-auto grid max-w-[1200px] gap-8 px-4 py-8 lg:grid-cols-2 lg:py-12">
        <section className="mt-card mt-rise p-6 sm:p-8">
          <span className="mt-chip">Tu negocio te espera</span>
          <h1 className="mt-title mt-4 text-[2.1rem] sm:text-[2.6rem]">Bienvenido de vuelta</h1>
          <p className="mt-muted mt-2">Entra a tu cuenta para seguir construyendo tu negocio.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mt-label" htmlFor="mt-login-email">Correo electrónico</label>
              <div className="relative">
                <Mail className="mt-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input
                  id="mt-login-email" type="email" autoComplete="email" className="mt-input pl-10"
                  placeholder="tu@correo.com" value={email} onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mt-label" htmlFor="mt-login-pass">Contraseña</label>
              <div className="relative">
                <Lock className="mt-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input
                  id="mt-login-pass" type={show ? "text" : "password"} autoComplete="current-password"
                  className="mt-input px-10" placeholder="Ingresa tu contraseña"
                  value={password} onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button" onClick={() => setShow((value) => !value)}
                  aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="mt-muted absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 accent-[#3b46f1]" />
                Recordarme
              </label>
              <button type="button" className="text-sm font-semibold text-[#3b46f1]" onClick={handleForgot}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button type="submit" className="mt-btn mt-btn-primary w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Entrar a MiTienda <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#e5e9f2]" />
            <span className="mt-muted text-sm">o continúa con</span>
            <span className="h-px flex-1 bg-[#e5e9f2]" />
          </div>
          <SocialButtons mode="login" />

          <p className="mt-muted mt-6 text-center text-sm">
            ¿Todavía no tienes tienda?{" "}
            <Link to="/mitienda/registro" className="font-semibold text-[#3b46f1]">Crear mi cuenta</Link>
          </p>
        </section>

        <section className="mt-aurora mt-card hidden overflow-hidden p-6 lg:block">
          <span className="mt-chip">Más que una tienda online</span>
          <h2 className="mt-title mt-4 text-[2rem]">
            Todo lo que necesitas para{" "}
            <span className="text-[#3b46f1]">hacer crecer tu negocio.</span>
          </h2>
          <p className="mt-muted mt-2">Diseña, publica, cobra y administra tu tienda desde un solo lugar. Así de simple.</p>

          <div className="relative mt-6">
            <div className="mt-device-frame">
              <div className="flex items-center gap-1.5 border-b bg-[#f6f8fc] px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                <span className="h-2 w-2 rounded-full bg-[#28c840]" />
              </div>
              <StoreMock draft={demo} device="desktop" />
            </div>
            <div className="mt-phone-frame mt-float absolute -bottom-6 -left-3 w-[120px]">
              <StoreMock draft={demo} device="mobile" />
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {PERKS.map((perk) => (
              <div key={perk.title}>
                <span className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-white text-[#3b46f1]">
                  <perk.icon className="h-5 w-5" />
                </span>
                <p className="font-bold">{perk.title}</p>
                <p className="mt-muted text-sm">{perk.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-muted mt-6 flex items-center gap-2 text-sm"><Sparkles className="h-4 w-4 text-[#3b46f1]" /> Tu idea también vende.</p>
        </section>
      </main>
    </div>
  );
};

export default Login;
