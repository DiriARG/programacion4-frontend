import { z } from "zod";

import {
  certificadoSchema,
  fechaVencimientoSchema,
  observacionesSchema,
} from "./camposFichaMedicaSchema";

// La renovación no necesita alumnoId porque se obtiene de la ficha elegida en la tabla.
export const renovarFichaMedicaSchema = z.object({
  certificado: certificadoSchema,
  fechaVencimiento: fechaVencimientoSchema,
  observaciones: observacionesSchema,
});
