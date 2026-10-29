import { z } from "zod";

import { esFechaCalendarioValida } from "../utils/validacionesFecha";

const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;


export const registrarAsistenciaSchema = z.object({
  alumnoId: z
    .string()
    .trim()
    .min(1, "Seleccioná un alumno.")
    // Valida que contenga solo números enteros.
    .regex(/^\d+$/, "El alumno seleccionado no es válido.")
    .transform(Number),
  turnoId: z
    .string()
    .trim()
    .refine(
      (valor) => valor === "" || valor === "LIBRE" || /^\d+$/.test(valor),
      "El turno seleccionado no es válido.",
    )
     // Un turno vacío se convierte en null para representar entrenamiento libre.
    .transform((valor) =>
      valor === "" || valor === "LIBRE" ? null : Number(valor),
    ),
  fecha: z
    .string()
    .min(1, "La fecha de la asistencia es obligatoria.")
    .refine(esFechaCalendarioValida, "Ingresá una fecha válida."),

  hora: z
    .string()
    .min(1, "La hora de la asistencia es obligatoria.")
    .refine((valor) => formatoHora.test(valor), "Ingresá una hora válida."),
});
