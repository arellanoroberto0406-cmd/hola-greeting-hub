import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buyerContactSchema, customerFaqSchema } from './buyerContact';
test('Buyer contact requires a name and valid email; phone is optional', () => {
  assert.equal(buyerContactSchema.safeParse({ full_name: '', email: 'invalid', phone: '' }).success, false);
  assert.deepEqual(buyerContactSchema.parse({ full_name: ' Ana ', email: 'ana@example.com', phone: '' }), { full_name: 'Ana', email: 'ana@example.com', phone: '' });
});
test('Customer FAQ requires both a question and answer', () => {
  assert.equal(customerFaqSchema.safeParse({ question: '¿Tienen recogida?', answer: '' }).success, false);
  assert.deepEqual(customerFaqSchema.parse({ question: ' ¿Tienen recogida? ', answer: ' Sí, con cita. ' }), { question: '¿Tienen recogida?', answer: 'Sí, con cita.' });
});