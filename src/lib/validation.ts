import { z } from "zod";

// Reusable validation schemas for security across the app

export const sanitizeHtml = (val: string) => val.replace(/<[^>]*>/g, "").trim();

export const safeString = (maxLen = 200) =>
  z.string().trim().transform(sanitizeHtml).pipe(z.string().max(maxLen));

export const emailSchema = z
  .string()
  .trim()
  .email("Email inválido")
  .max(255)
  .transform((v) => v.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(128, "La contraseña es demasiado larga")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número");

export const phoneSchema = z
  .string()
  .trim()
  .min(10, "Teléfono inválido")
  .max(15)
  .regex(/^[\d+\-() ]+$/, "Formato de teléfono inválido");

export const nameSchema = safeString(50).pipe(
  z.string().min(2, "Mínimo 2 caracteres")
);

export const addressSchema = safeString(200).pipe(
  z.string().min(5, "Dirección muy corta")
);

export const storeNameSchema = safeString(100).pipe(
  z.string().min(2, "Nombre muy corto")
);

export const slugSchema = z
  .string()
  .trim()
  .min(3, "Mínimo 3 caracteres")
  .max(50)
  .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones");

export const signUpSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Contraseña requerida"),
});

export const checkoutSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema,
  city: safeString(100).pipe(z.string().min(2, "Ciudad requerida")),
  state: z.string().min(1, "Estado requerido"),
  zipCode: z.string().trim().min(5, "Código postal inválido").max(10),
});
