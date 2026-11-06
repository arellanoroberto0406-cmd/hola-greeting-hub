export type CatalogEntry = { id: string; store_id: string; stock: number };
export function validateRecommendations<T extends CatalogEntry>(
  catalog: T[], storeId: string, suggestions: { productId: string; reason: string }[],
) {
  const allowed = new Map(catalog.filter(p => p.store_id === storeId && p.stock > 0).map(p => [p.id, p]));
  const seen = new Set<string>();
  return suggestions.filter(item => {
    if (!allowed.has(item.productId) || seen.has(item.productId)) return false;
    seen.add(item.productId);
    return true;
  }).slice(0, 4).map(item => ({ productId: item.productId, reason: item.reason.trim().slice(0, 280) }));
}