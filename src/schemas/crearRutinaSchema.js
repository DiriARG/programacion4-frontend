import { z } from "zod";

import { nombresDias } from "../utils/formatearDiaYHora";

const idPositivoSchema = (mensaje) =>
  z
    .string()
    .trim()
    .min(1, mensaje)
    .pipe(
      z
        .string()
        .regex(/^[1-9]\d*$/, "El identificador seleccionado no es válido.")
        .transform(Number),
    );

const enteroPositivoSchema = (mensaje) =>
  z
    .string()
    .trim()
    .min(1, mensaje)
    .pipe(
      z
        .string()
        .regex(/^[1-9]\d*$/, "Ingresá un número entero mayor que cero.")
        .transform(Number),
    );

const ejercicioRutinaSchema = z.object({
  ejercicioId: idPositivoSchema("Seleccioná un ejercicio."),

  series: enteroPositivoSchema("La cantidad de series es obligatoria."),

  repeticiones: enteroPositivoSchema(
    "La cantidad de repeticiones es obligatoria.",
  ),

  peso: z
    .string()
    .trim()
    .pipe(
      z
        .string()
        .refine(
          (valor) => valor === "" || /^(?:\d{1,3})(?:\.\d{1,2})?$/.test(valor),
          "El peso debe tener como máximo 3 enteros y 2 decimales.",
        )
        .transform((valor) => (valor === "" ? null : Number(valor))),
    ),

  diaSemana: z
    .string()
    .trim()
    .min(1, "Seleccioná un día de la semana.")
    .pipe(
      z
        .string()
        .refine(
          (dia) => Object.hasOwn(nombresDias, dia),
          "El día de la semana no es válido.",
        ),
    ),
});

export const crearRutinaSchema = z.object({
  alumnoId: idPositivoSchema("Seleccioná un alumno."),

  nombre: z
    .string()
    .trim()
    .min(1, "El nombre de la rutina es obligatorio.")
    .max(100, "El nombre no puede superar los 100 caracteres."),

  ejercicios: z
    .array(ejercicioRutinaSchema)
    .min(1, "La rutina debe contener al menos un ejercicio."),
});

export default crearRutinaSchema;
