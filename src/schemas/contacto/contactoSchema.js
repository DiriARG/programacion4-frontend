import { z } from "zod";

export const contactoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(80, "El nombre no puede superar los 80 caracteres."),

  telefono: z
    .string()
    .trim()
    .max(25, "El teléfono no puede superar los 25 caracteres.")
    .regex(/^[0-9+\-().\s]+$/, "Ingresá un número de teléfono válido.")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .trim()
    .min(1, "El email es obligatorio.")
    .max(254, "El email no puede superar los 254 caracteres.")
    .pipe(z.email("Ingresá un email válido.")),

  mensaje: z
    .string()
    .trim()
    .min(10, "Contanos un poco más (mínimo 10 caracteres).")
    .max(1000, "El mensaje no puede superar los 1000 caracteres."),
});
