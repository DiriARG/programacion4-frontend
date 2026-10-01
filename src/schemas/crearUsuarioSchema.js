import { z } from "zod";

export const crearUsuarioSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio."),

  apellido: z.string().trim().min(1, "El apellido es obligatorio."),

  dni: z
    .string()
    .trim()
    .min(1, "El DNI es obligatorio.")
    .regex(/^[0-9]{7,8}$/, "El DNI debe contener entre 7 y 8 números."),

  email: z
    .string()
    .trim()
    .min(1, "El email es obligatorio.")
    .pipe(z.email("El formato del email no es válido.")),

  telefono: z
    .string()
    .trim()
    .min(1, "El teléfono es obligatorio.")
    .regex(/^[0-9+\s-]{6,20}$/, "El formato del teléfono no es válido."),

  contrasenia: z
    .string()
    .min(8, "La contraseña debe tener entre 8 y 64 caracteres.")
    .max(64, "La contraseña debe tener entre 8 y 64 caracteres."),
});
