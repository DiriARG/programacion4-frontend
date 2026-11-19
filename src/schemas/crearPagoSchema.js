import { z } from "zod";

export const METODOS_PAGO = [
  "EFECTIVO",
  "TRANSFERENCIA",
  "TARJETA_DEBITO",
  "TARJETA_CREDITO",
  "MERCADO_PAGO",
];

export const crearPagoSchema = z.object({
  alumnoId: z.string().min(1, "Seleccioná un alumno.").transform(Number),

  planId: z.string().min(1, "Seleccioná un plan.").transform(Number),

  // coerce.string: el monto puede venir como number (precio del plan) o como string (input).
  montoAbonado: z.coerce
    .string()
    .trim()
    .min(1, "El monto abonado es obligatorio.")
    .regex(
      /^\d{1,8}([.,]\d{1,2})?$/,
      "El monto debe tener como máximo 8 dígitos enteros y 2 decimales.",
    )
    .refine(
      (valor) => Number(valor.replace(",", ".")) > 0,
      "El monto abonado debe ser mayor a cero.",
    )
    .transform((valor) => Number(valor.replace(",", "."))),

  fechaPago: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de pago es obligatoria."),

  mesPeriodo: z.coerce
    .number()
    .int("El mes del período no es válido.")
    .min(1, "El mes del período debe estar entre 1 y 12.")
    .max(12, "El mes del período debe estar entre 1 y 12."),

  anioPeriodo: z.coerce
    .number()
    .int("El año del período no es válido.")
    .min(2000, "El año del período no es válido.")
    .max(2100, "El año del período no es válido."),

  metodoPago: z
    .string()
    .refine((m) => METODOS_PAGO.includes(m), "Seleccioná un método de pago válido."),
});