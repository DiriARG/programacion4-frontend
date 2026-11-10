import { z } from "zod";
import { crearEjercicioSchema } from "./crearEjercicioSchema";

// Se reutilizan las validaciones del esquema de creación (con ".extend"), agregando solamente el campo necesario para la modificación.
export const modificarEjercicioSchema = crearEjercicioSchema.extend({
  eliminarImagen: z.boolean(),
});