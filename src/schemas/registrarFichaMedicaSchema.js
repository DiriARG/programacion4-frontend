import { z } from "zod";

import {
  certificadoSchema,
  fechaVencimientoSchema,
  observacionesSchema,
} from "./camposFichaMedicaSchema";

export const registrarFichaMedicaSchema = z.object({
  alumnoId: z
    .string()
    .trim()
    .min(1, "Seleccioná un alumno.")
    .regex(/^\d+$/, "El alumno seleccionado no es válido.")
    .transform(Number),

  certificado: certificadoSchema,
  fechaVencimiento: fechaVencimientoSchema,
  observaciones: observacionesSchema,
});
