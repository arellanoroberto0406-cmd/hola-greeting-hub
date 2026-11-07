import { z } from 'zod';
export const buyerContactSchema = z.object({
  full_name: z.string().trim().min(1, 'Escribe tu nombre.').max(120),
  email: z.string().trim().email('Escribe un correo válido.').max(254),
  phone: z.string().trim().max(30).refine(value => !value || /^[+\d\s().-]{7,30}$/.test(value), 'Escribe un teléfono válido.'),
});
export const customerFaqSchema = z.object({
  question: z.string().trim().min(1, 'Escribe una pregunta.').max(200),
  answer: z.string().trim().min(1, 'Escribe una respuesta.').max(2000),
});