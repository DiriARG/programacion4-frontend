import { z } from "zod";

export const crearPlanSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre del plan es obligatorio.")
    .max(50, "El nombre del plan no puede superar los 50 caracteres."),

  descripcion: z
    .string()
    .trim()
    .min(1, "La descripción del plan es obligatoria.")
    .max(200, "La descripción no puede superar los 200 caracteres."),

  /* Se recibe como string porque proviene de un campo de formulario.
  Primero se valida el formato y que el valor sea mayor que cero; finalmente se reemplaza la coma decimal por un punto y se transforma a number.*/
  precioMensual: z
    .string()
    .trim()
    .min(1, "El precio mensual es obligatorio.")
    .regex(
      /^\d{1,8}([.,]\d{1,2})?$/,
      "El precio debe tener como máximo 8 dígitos enteros y 2 decimales.",
    )
    .refine(
      (valor) => Number(valor.replace(",", ".")) > 0,
      "El precio mensual debe ser mayor a cero.",
    )
    .transform((valor) => Number(valor.replace(",", "."))),

  beneficios: z
    .array(z.string().trim().min(1, "El beneficio no puede estar vacío."))
    .min(1, "El plan debe tener al menos un beneficio."),
});
