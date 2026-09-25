import { ReactNode, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import "@/mitienda/mitienda.css";
import MtSidebar from "./MtSidebar";
import MtTopbar from "./MtTopbar";
import MtAiPanel from "./MtAiPanel";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Props {
  children: ReactNode;
  planName: string;
  newOrders: number;
  notices: { id: string; text: string }[];
  aiContext: string;
  previewTo: string;
  aiSeed?: string | null;
  onAiSeedUsed?: () => void;
  aiOpen?: boolean;
  onAiOpenChange?: (open: boolean) => void;
}

const MtLayout = ({
  children, planName, newOrders, notices, aiContext, previewTo,
  aiSeed, onAiSeedUsed, aiOpen, onAiOpenChange,
}: Props) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();
  const [drawer, setDrawer] = useState(false);
  const [localAi, setLocalAi] = useState(false);

  const openAi = aiOpen ?? localAi;
  const setAi = (value: boolean) => (onAiOpenChange ? onAiOpenChange(value) : setLocalAi(value));

  const fullName = profile?.full_name || user?.email?.split("@")[0] || "Mi cuenta";
  const initials = useMemo(
    () => fullName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "MT",
    [fullName],
  );

  const handleSignOut = async () => {
    await signOut();
    navigate("/mitienda");
  };

  const sidebar = (onNavigate?: () => void) => (
    <MtSidebar
      planName={planName}
      newOrders={newOrders}
      onAsk={() => { setAi(true); onNavigate?.(); }}
      onPlans={() => { navigate("/mitienda#precios"); onNavigate?.(); }}
      onHelp={() => toast({ title: "Ayuda", description: "Escríbenos desde el asistente y te guiamos paso a paso." })}
      onResources={() => toast({ title: "Centro de recursos", description: "Guías para vender más, muy pronto en tu panel." })}
      onSignOut={handleSignOut}
      onNavigate={onNavigate}
    />
  );

  return (
    <div className="mt mt-shell min-h-screen">
      <div className="flex">
        <aside className="mt-sidebar hidden lg:block">{sidebar()}</aside>

        {drawer && (
          <div className="fixed inset-0 z-[55] flex lg:hidden">
            <div className="w-[82%] max-w-[300px] bg-white shadow-2xl">
              <div className="flex justify-end p-2">
                <button type="button" className="mt-icon-btn" aria-label="Cerrar menú" onClick={() => setDrawer(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="h-[calc(100%-3rem)]">{sidebar(() => setDrawer(false))}</div>
            </div>
            <button type="button" aria-label="Cerrar menú" className="flex-1 bg-slate-900/40" onClick={() => setDrawer(false)} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <MtTopbar
            initials={initials}
            name={fullName}
            role="Administrador"
            notices={notices}
            onMenu={() => setDrawer(true)}
            onPreview={() => navigate(previewTo)}
            onSignOut={handleSignOut}
          />
          <main className="mx-auto max-w-[1360px] p-4 sm:p-5">{children}</main>
        </div>
      </div>

      <MtAiPanel open={openAi} onClose={() => setAi(false)} context={aiContext} seed={aiSeed} onSeedUsed={onAiSeedUsed} />
    </div>
  );
};

export default MtLayout;
