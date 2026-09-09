import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Eye, EyeOff, Link2, Loader2, Lock, Mail, Package, Phone, Store, User } from "lucide-react";
import "@/mitienda/mitienda.css";
import MtNav from "@/mitienda/components/MtNav";
import SocialButtons from "@/mitienda/components/SocialButtons";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const PERKS = [
  { icon: Store, title: "Crea tu tienda en minutos", text: "Sin conocimientos técnicos. Fácil y rápido.", tone: "#eef1ff" },
  { icon: Link2, title: "Comparte tu enlace", text: "Vende en redes sociales, WhatsApp o donde quieras.", tone: "#f3edff" },
  { icon: Package, title: "Tus productos, a tu manera", text: "Publica, organiza y gestiona tu catálogo sin límites.", tone: "#e9fbf2" },
  { icon: BarChart3, title: "Haz crecer tu negocio", text: "Llega a más clientes y convierte tus ideas en realidad.", tone: "#fff4e6" },
];

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.password.length < 8) {
      toast({
        title: "Revisa tus datos",
        description: "Necesitamos tu nombre, correo y una contraseña de al menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email.trim(), form.password, form.name.trim());
    setLoading(false);
    if (error) {
      const known = error.message.includes("already registered") || error.message.includes("User already");
      toast({
        title: known ? "Ese correo ya tiene cuenta" : "No se pudo crear la cuenta",
        description: known ? "Inicia sesión para continuar con tu tienda." : error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "¡Cuenta creada!", description: "Vamos a crear tu tienda." });
    navigate("/mitienda/crear");
  };

  return (
    <div className="mt mt-shell">
      <MtNav />
      <main className="mx-auto grid max-w-[1200px] gap-8 px-4 py-8 lg:grid-cols-2 lg:py-12">
        <section className="mt-rise">
          <span className="mt-chip">Tu negocio empieza aquí</span>
          <h1 className="mt-title mt-4 text-[2.1rem] sm:text-[2.7rem]">
            Empieza a crear <span className="text-[#3b46f1]">tu tienda</span>
          </h1>
          <p className="mt-muted mt-2">Crea tu cuenta en minutos y comienza gratis.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mt-label" htmlFor="mt-name">Nombre completo</label>
              <div className="relative">
                <User className="mt-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input id="mt-name" className="mt-input pl-10" placeholder="Tu nombre y apellido"
                  value={form.name} onChange={(event) => set("name", event.target.value)} autoComplete="name" />
              </div>
            </div>

            <div>
              <label className="mt-label" htmlFor="mt-email">Correo electrónico</label>
              <div className="relative">
                <Mail className="mt-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input id="mt-email" type="email" className="mt-input pl-10" placeholder="tucorreo@ejemplo.com"
                  value={form.email} onChange={(event) => set("email", event.target.value)} autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="mt-label" htmlFor="mt-pass">Contraseña</label>
              <div className="relative">
                <Lock className="mt-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input id="mt-pass" type={show ? "text" : "password"} className="mt-input px-10"
                  placeholder="Crea una contraseña segura" value={form.password}
                  onChange={(event) => set("password", event.target.value)} autoComplete="new-password" />
                <button type="button" onClick={() => setShow((value) => !value)}
                  aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="mt-muted absolute right-3 top-1/2 -translate-y-1/2">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-muted mt-1.5 text-xs">Mínimo 8 caracteres, con letras, números y un símbolo.</p>
            </div>

            <div>
              <label className="mt-label" htmlFor="mt-phone">Teléfono <span className="mt-muted font-normal">(opcional)</span></label>
              <div className="relative">
                <Phone className="mt-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input id="mt-phone" className="mt-input pl-10" placeholder="+52 55 1234 5678"
                  value={form.phone} onChange={(event) => set("phone", event.target.value)} autoComplete="tel" />
              </div>
            </div>

            <button type="submit" className="mt-btn mt-btn-primary w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Crear mi cuenta y continuar <ArrowRight className="h-4 w-4" /></>}
            </button>
            <p className="mt-muted text-center text-sm">No necesitas tarjeta. Puedes empezar gratis.</p>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#e5e9f2]" />
            <span className="mt-muted text-sm">o continúa con</span>
            <span className="h-px flex-1 bg-[#e5e9f2]" />
          </div>
          <SocialButtons mode="signup" layout="row" />

          <p className="mt-muted mt-6 text-center text-sm">
            ¿Ya tienes cuenta? <Link to="/mitienda/login" className="font-semibold text-[#3b46f1]">Iniciar sesión</Link>
          </p>
        </section>

        <section className="mt-aurora mt-card hidden p-7 lg:block">
          <h2 className="mt-title text-[2rem]">
            Tu tienda, tu enlace,
            <br />
            <span className="text-[#3b46f1]">tus productos</span>
          </h2>
          <p className="mt-muted mt-2">Todo lo que necesitas para vender en un solo lugar.</p>

          <div className="mt-7 space-y-4">
            {PERKS.map((perk) => (
              <div key={perk.title} className="flex gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[#3b46f1]" style={{ background: perk.tone }}>
                  <perk.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold">{perk.title}</p>
                  <p className="mt-muted text-sm">{perk.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-card mt-8 flex items-center justify-between p-4">
            <div>
              <p className="mt-muted text-xs font-semibold">Ventas de hoy</p>
              <p className="text-2xl font-extrabold text-[#10b981]">+62%</p>
            </div>
            <div className="flex h-12 items-end gap-1">
              {[30, 45, 38, 60, 72, 90].map((height) => (
                <span key={height} className="w-2.5 rounded-t bg-gradient-to-t from-[#7c5cff] to-[#3b46f1]" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Signup;
