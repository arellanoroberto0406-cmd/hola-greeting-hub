import { useState } from "react";
import { Bot, Check, Loader2, Lock, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FONT_OPTIONS, SECTION_CONFIGS, StoreDesignProposal, StoreSection, PlanTier, canUseSectionType } from "@/types/storeLayout";

interface AiDesignAssistantProps {
  storeId: string;
  planTier: PlanTier;
  sections: StoreSection[];
  onApply: (proposal: StoreDesignProposal) => void;
}

const EXAMPLES = [
  "Una boutique juvenil, alegre y atrevida que destaque promociones",
  "Una tienda elegante y minimalista para productos artesanales premium",
  "Una marca urbana con mucha energía, contraste y productos protagonistas",
];

const AiDesignAssistant = ({ storeId, planTier, sections, onApply }: AiDesignAssistantProps) => {
  const [description, setDescription] = useState("");
  const [proposal, setProposal] = useState<StoreDesignProposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    const clean = description.trim();
    if (clean.length < 10 || loading) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("generate-store-design", {
        body: { storeId, description: clean, planTier, currentSections: sections.filter((section) => section.enabled).map((section) => section.type) },
      });
      const response = data as { proposal?: StoreDesignProposal; error?: string } | null;
      if (invokeError || !response?.proposal) throw new Error(response?.error || invokeError?.message || "No se pudo generar la propuesta.");
      setProposal(response.proposal);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "No se pudo generar la propuesta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-muted/30 p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></span>
          <div><h4 className="font-semibold">Describe la tienda que imaginas</h4><p className="text-sm text-muted-foreground">Incluye el tipo de cliente, sensación, productos y lo que quieres destacar.</p></div>
        </div>
        <Textarea value={description} onChange={(event) => setDescription(event.target.value.slice(0, 1200))} rows={5} placeholder="Ejemplo: Quiero una tienda moderna para joyería artesanal, elegante pero cercana, con colores cálidos y fotos grandes…" />
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => <Button key={example} type="button" variant="outline" size="sm" className="h-auto whitespace-normal text-left text-xs" onClick={() => setDescription(example)}>{example}</Button>)}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{description.length}/1200</span>
          <Button onClick={generate} disabled={description.trim().length < 10 || loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}{loading ? "Creando propuesta…" : proposal ? "Generar otra" : "Crear propuesta"}
          </Button>
        </div>
      </div>

      {error && <Alert variant="destructive"><AlertTitle>No pudimos crear la propuesta</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

      {proposal && (
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="border-b p-5 sm:p-6">
            <Badge className="mb-3 gap-1"><Sparkles className="h-3 w-3" /> Propuesta personalizada</Badge>
            <h4 className="text-2xl font-bold">{proposal.name}</h4>
            <p className="mt-2 text-sm text-muted-foreground">{proposal.rationale}</p>
          </div>
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold">Paleta de colores</p>
              <div className="grid grid-cols-3 gap-2">
                {[proposal.primaryColor, proposal.secondaryColor, proposal.accentColor].map((color) => <div key={color}><div className="h-20 rounded-md border" style={{ backgroundColor: color }} /><p className="mt-1 text-center font-mono text-xs">{color}</p></div>)}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">Tipografías</p>
              <div className="space-y-2 rounded-md border p-4">
                <p className="text-xl font-bold" style={{ fontFamily: FONT_OPTIONS.find((font) => font.value === proposal.headingFont)?.label }}>Título — {FONT_OPTIONS.find((font) => font.value === proposal.headingFont)?.label}</p>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: FONT_OPTIONS.find((font) => font.value === proposal.bodyFont)?.label }}>Texto para describir tus productos — {FONT_OPTIONS.find((font) => font.value === proposal.bodyFont)?.label}</p>
              </div>
            </div>
          </div>
          <div className="border-t p-5 sm:p-6">
            <p className="mb-3 text-sm font-semibold">Secciones recomendadas</p>
            <div className="flex flex-wrap gap-2">
              {proposal.sections.map((type) => {
                const config = SECTION_CONFIGS.find((section) => section.type === type);
                const available = canUseSectionType(type, planTier);
                return <Badge key={type} variant={available ? "secondary" : "outline"} className="gap-1.5">{!available && <Lock className="h-3 w-3" />}{config?.icon} {config?.label || type}</Badge>;
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Las funciones de otro plan se muestran como recomendación, pero no se activarán.</p>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t bg-muted/20 p-4 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={generate} disabled={loading} className="gap-2"><RefreshCw className="h-4 w-4" /> Generar otra</Button>
            <Button onClick={() => onApply(proposal)} className="gap-2"><Check className="h-4 w-4" /> Aplicar a la vista previa</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiDesignAssistant;