import { useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { MT_BRAND } from "../draft";

interface Msg { role: "user" | "assistant"; content: string }

interface Props {
  open: boolean;
  onClose: () => void;
  context: string;
  seed?: string | null;
  onSeedUsed?: () => void;
}

const MtAiPanel = ({ open, onClose, context, seed, onSeedUsed }: Props) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || loading) return;
    const next = [...messages, { role: "user" as const, content: clean }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mitienda-ia", {
        body: { messages: next, context },
      });
      const reply = (data as { reply?: string; error?: string } | null)?.reply;
      const failure = (data as { error?: string } | null)?.error;
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            reply ||
            failure ||
            (error ? "El asistente no pudo responder ahora. Intenta de nuevo." : "Sin respuesta."),
        },
      ]);
    } catch {
      setMessages([...next, { role: "assistant", content: "El asistente no pudo responder ahora. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && seed) {
      void send(seed);
      onSeedUsed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seed]);

  useEffect(() => {
    if (open) fieldRef.current?.focus();
  }, [open, loading]);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-slate-900/40" role="dialog" aria-modal="true" aria-label={`${MT_BRAND} IA`}>
      <button type="button" aria-label="Cerrar" className="flex-1" onClick={onClose} />
      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center gap-3 border-b bg-gradient-to-r from-[#3b46f1] to-[#7c5cff] p-4 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20"><Bot className="h-5 w-5" /></span>
          <div className="flex-1">
            <p className="font-bold">{MT_BRAND} IA</p>
            <p className="text-xs opacity-90">Tu asistente de negocios</p>
          </div>
          <button type="button" aria-label="Cerrar asistente" onClick={onClose}><X className="h-5 w-5" /></button>
        </header>

        <div ref={boxRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="mt-muted text-sm">
              <p>Cuéntame qué necesitas para tu tienda. Por ejemplo:</p>
              <ul className="mt-2 list-disc pl-5">
                <li>Escribe la descripción de un producto</li>
                <li>Créame una promoción para el Buen Fin</li>
                <li>¿Qué precio le pongo a mis playeras?</li>
              </ul>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className={message.role === "user" ? "flex justify-end" : ""}>
              <div
                className={
                  message.role === "user"
                    ? "max-w-[85%] rounded-2xl bg-[#3b46f1] px-3 py-2 text-sm text-white"
                    : "prose prose-sm max-w-none text-[#0f172a]"
                }
              >
                {message.role === "user" ? message.content : <ReactMarkdown>{message.content}</ReactMarkdown>}
              </div>
            </div>
          ))}
          {loading && <p className="mt-muted animate-pulse text-sm">Pensando…</p>}
        </div>

        <form
          className="flex items-end gap-2 border-t p-3"
          onSubmit={(event) => { event.preventDefault(); void send(input); }}
        >
          <textarea
            ref={fieldRef}
            rows={2}
            className="mt-input resize-none"
            placeholder="Escribe lo que necesitas…"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send(input);
              }
            }}
          />
          <button type="submit" className="mt-btn mt-btn-primary !px-4" disabled={loading || !input.trim()} aria-label="Enviar">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </aside>
    </div>
  );
};

export default MtAiPanel;
