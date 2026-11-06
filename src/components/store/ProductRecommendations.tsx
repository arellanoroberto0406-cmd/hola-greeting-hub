import { useEffect, useRef, useState } from 'react';
import { Search, Sparkles, Loader2, Square, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/product';

type Result = { summary: string; recommendations: { productId: string; reason: string }[] };
export default function ProductRecommendations({ storeId, products, onProductClick }: {
  storeId: string; products: Product[]; onProductClick: (product: Product) => void;
}) {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), [storeId]);
  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading || description.trim().length < 5) return;
    const abort = new AbortController();
    controller.current = abort;
    setLoading(true); setError(''); setResult(null);
    try {
      const { data, error: failure } = await supabase.functions.invoke('recommend-store-products', {
        body: { storeId, description: description.trim() }, signal: abort.signal,
      });
      if (abort.signal.aborted) return;
      if (failure) {
        let message = 'No se pudo completar la búsqueda. El catálogo sigue disponible.';
        if (failure.context instanceof Response) {
          const body = await failure.context.json().catch(() => null);
          if (typeof body?.error === 'string') message = body.error;
        }
        throw new Error(message);
      }
      if (data?.error) throw new Error(data.error);
      if (!data || !Array.isArray(data.recommendations)) throw new Error('La recomendación recibida no es válida.');
      setResult(data as Result);
    } catch (failure) {
      if (!abort.signal.aborted) setError(failure instanceof Error ? failure.message : 'No se pudo completar la búsqueda.');
    } finally {
      if (controller.current === abort) { setLoading(false); controller.current = null; }
    }
  };
  const matches = result?.recommendations.flatMap(item => {
    const product = products.find(p => p.id === item.productId && p.stock > 0);
    return product ? [{ product, reason: item.reason }] : [];
  }) ?? [];
  return (
    <section className="vc-recommendations mb-8" aria-labelledby="recommendation-title">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="vc-recommendation-icon h-6 w-6 shrink-0" />
        <h2 id="recommendation-title" className="vc-heading text-xl sm:text-2xl">Encuentra tu próximo favorito</h2>
      </div>
      <form onSubmit={search} className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="flex-1 min-w-0">
          <label htmlFor="shopping-description" className="sr-only">¿Qué estás buscando?</label>
          <Textarea id="shopping-description" className="vc-recommendation-input min-h-24" placeholder="Busco un regalo elegante, en tonos dorados, por menos de $500…" maxLength={1200} value={description} onChange={e => setDescription(e.target.value)} disabled={loading} />
        </div>
        {loading ? <Button type="button" variant="outline" className="vc-recommendation-stop h-auto min-h-12" onClick={() => { controller.current?.abort(); setLoading(false); }}><Square className="h-4 w-4 mr-2" />Detener</Button>
          : <Button type="submit" className="vc-btn-fire h-auto min-h-12 sm:max-w-44 whitespace-normal" disabled={description.trim().length < 5 || !products.some(p => p.stock > 0)}><Search className="h-4 w-4 mr-2 shrink-0" />Buscar con IA</Button>}
      </form>
      {loading && <p role="status" className="vc-recommendation-note flex items-center gap-2 mt-4"><Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />Buscando en el catálogo…</p>}
      {error && <p role="alert" className="vc-recommendation-error mt-4 break-words">{error}</p>}
      {result && <div aria-live="polite" className="mt-5">
        <p className="vc-recommendation-note mb-4">{result.summary}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {matches.map(({ product, reason }) => <article key={product.id} className="vc-recommendation-result min-w-0">
            <img src={product.image} alt={product.name} className="w-full aspect-square object-contain" loading="lazy" />
            <div className="p-4 flex flex-col gap-3">
              <h3 className="font-bold break-words">{product.name}</h3>
              <strong className="vc-recommendation-icon">${product.price.toLocaleString('es-MX')}</strong>
              <p className="vc-recommendation-note text-sm break-words">{reason}</p>
              <Button variant="outline" className="vc-recommendation-stop w-full" onClick={() => onProductClick(product)}>Ver producto<ArrowUpRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </article>)}
        </div>
      </div>}
    </section>
  );
}