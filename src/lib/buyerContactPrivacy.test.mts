import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = Object.fromEntries(readFileSync(new URL('../../.env', import.meta.url), 'utf8').split('\n').filter(line => line.includes('=')).map(line => {
  const index = line.indexOf('=');
  return [line.slice(0, index), line.slice(index + 1).trim().replace(/^["']|["']$/g, '')];
}));
const url = config.VITE_SUPABASE_URL;
const key = config.VITE_SUPABASE_PUBLISHABLE_KEY;

test('Visitors cannot read buyer contact cards', async () => {
  assert.ok(url && key, 'Public connection configuration is required');
  const response = await fetch(`${url}/rest/v1/store_buyer_contacts?select=full_name,email,phone`, { headers: { apikey: key } });
  assert.ok([401, 403].includes(response.status), `Expected access denied, received ${response.status}`);
});
test('Visitors cannot publish customer FAQ answers', async () => {
  assert.ok(url && key, 'Public connection configuration is required');
  const response = await fetch(`${url}/rest/v1/store_customer_faqs`, { method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' }, body: JSON.stringify({ store_id: '00000000-0000-0000-0000-000000000000', question: 'Privacy test', answer: 'Must not publish' }) });
  assert.ok([401, 403].includes(response.status), `Expected access denied, received ${response.status}`);
});