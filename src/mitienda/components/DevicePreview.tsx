import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import StoreMock from "./StoreMock";
import { StoreDraft } from "../draft";
import { Button } from '@/components/ui/button';
import '@/styles/store-creator.css';

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
      <div className="creator-device-toolbar">
        <div>
          <p className="mt-chip">✨ {title}</p>
          {subtitle && <p className="mt-muted mt-1 text-sm">{subtitle}</p>}
        </div>
        {withToggle && (
          <div className="creator-device-toggle">
            <Button variant="ghost" size="icon"
              type="button"
              onClick={() => setDevice("desktop")}
              aria-pressed={device === "desktop"}
              aria-label="Vista escritorio"
              className="mt-btn mt-btn-sm"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon"
              type="button"
              onClick={() => setDevice("mobile")}
              aria-pressed={device === "mobile"}
              aria-label="Vista móvil"
              className="mt-btn mt-btn-sm"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {device === "desktop" ? (
        <div className="relative">
          <div className="mt-device-frame">
            <div className="creator-browser-bar">
              <span className="creator-browser-dot" /><span className="creator-browser-dot" /><span className="creator-browser-dot" />
              <span className="creator-browser-address">
                mitienda.mx/{draft.slug || "tu-tienda"}
              </span>
            </div>
            <StoreMock draft={draft} device="desktop" />
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
