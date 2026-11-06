import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRecommendations } from '../../supabase/functions/recommend-store-products/catalog.ts';

test('Recommendations come only from the current store catalog', () => {
  const result = validateRecommendations([{ id: 'a', store_id: 'shop', stock: 2 }, { id: 'b', store_id: 'other', stock: 1 }], 'shop', [{ productId: 'a', reason: 'Relevant' }, { productId: 'b', reason: 'Other' }, { productId: 'invented', reason: 'Fake' }]);
  assert.deepEqual(result.map(p => p.productId), ['a']);
});
test('Unavailable and duplicate products are not recommended', () => {
  const result = validateRecommendations([{ id: 'a', store_id: 'shop', stock: 0 }, { id: 'b', store_id: 'shop', stock: 1 }], 'shop', [{ productId: 'a', reason: 'Unavailable' }, { productId: 'b', reason: 'Relevant' }, { productId: 'b', reason: 'Repeated' }]);
  assert.deepEqual(result.map(p => p.productId), ['b']);
});