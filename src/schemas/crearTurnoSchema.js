import { z } from "zod";

import { nombresDias } from "../utils/formatearDiaYHora";

// Valida desde 00:00 hasta 23:59.
const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;

export const crearTurnoSchema = z
  .object({
    profesorId: z
      .string()
      .trim()
      .min(1, "El profesor es obligatorio.")
      .transform((valor) => Number(valor)),

    nombreClase: z
      .string()
      .trim()
      .min(1, "El nombre de la clase es obligatorio.")
      .max(100, "El nombre de la clase no puede superar los 100 caracteres."),

    diaSemana: z
      .string()
      .trim()
      .min(1, "El día de la semana es obligatorio.")
      .refine(
        (dia) => Object.hasOwn(nombresDias, dia),
        "El día de la semana no es válido.",
      ),

    horaInicio: z
      .string()
      .min(1, "La hora de inicio es obligatoria.")
      .refine(
        (hora) => hora === "" || formatoHora.test(hora),
        "La hora de inicio no es válida.",
      ),

    horaFin: z
      .string()
      .min(1, "La hora de fin es obligatoria.")
      .refine(
        (hora) => hora === "" || formatoHora.test(hora),
        "La hora de fin no es válida.",
      ),
  })
  // Valida el orden únicamente cuando ambas horas tienen un formato válido.
  .refine(
    ({ horaInicio, horaFin }) => {
      if (!formatoHora.test(horaInicio) || !formatoHora.test(horaFin)) {
        return true;
      }

      return horaInicio < horaFin;
    },
    {
      message: "La hora de inicio debe ser anterior a la hora de fin.",
      path: ["horaFin"],
    },
  );
