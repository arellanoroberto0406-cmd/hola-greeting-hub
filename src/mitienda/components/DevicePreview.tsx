import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import StoreMock from "./StoreMock";
import { StoreDraft } from "../draft";

interface Props {
  draft: StoreDraft;
  title?: string;
  subtitle?: string;
  withToggle?: boolean;
}

const DevicePreview = ({ draft, title = "Vista previa en tiempo real", subtitle, withToggle = true }: Props) => {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="mt-chip">✨ {title}</p>
          {subtitle && <p className="mt-muted mt-1 text-sm">{subtitle}</p>}
        </div>
        {withToggle && (
          <div className="flex rounded-xl border bg-white p-1">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              aria-pressed={device === "desktop"}
              aria-label="Vista escritorio"
              className="mt-btn mt-btn-sm"
              style={device === "desktop" ? { background: "#eaeeff", color: "#3b46f1" } : { background: "transparent", color: "#64748b" }}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              aria-pressed={device === "mobile"}
              aria-label="Vista móvil"
              className="mt-btn mt-btn-sm"
              style={device === "mobile" ? { background: "#eaeeff", color: "#3b46f1" } : { background: "transparent", color: "#64748b" }}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {device === "desktop" ? (
        <div className="relative">
          <div className="mt-device-frame">
            <div className="flex items-center gap-1.5 border-b bg-[#f6f8fc] px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
              <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
              <span className="h-2 w-2 rounded-full bg-[#28c840]" />
              <span className="mx-auto rounded-md bg-white px-3 py-0.5 text-[9px] text-slate-400">
                mitienda.mx/{draft.slug || "tu-tienda"}
              </span>
            </div>
            <StoreMock draft={draft} device="desktop" />
          </div>
          <div className="mt-phone-frame absolute -bottom-6 -right-3 hidden w-[130px] sm:block">
            <StoreMock draft={draft} device="mobile" />
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-phone-frame w-[240px]">
          <StoreMock draft={draft} device="mobile" />
        </div>
      )}
    </div>
  );
};

export default DevicePreview;
