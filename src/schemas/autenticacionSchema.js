import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El email es obligatorio.")
    .max(254, "El email no puede superar los 254 caracteres.")
    .pipe(z.email("El formato del email no es válido.")),

  contrasenia: z
    .string()
    .min(1, "La contraseña es obligatoria."),
});