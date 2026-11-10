import { z } from "zod";

import { nombresDias } from "../utils/formatearDiaYHora";

const idPositivoOpcionalSchema = z
  .string()
  .regex(/^[1-9]\d*$/, "El identificador no es válido.")
  .transform(Number)
  .optional();

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

const ejercicioRutinaSchema = z
  .object({
    rutinaEjercicioId: idPositivoOpcionalSchema,

    ejercicioId: idPositivoOpcionalSchema,

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
            (valor) =>
              valor === "" || /^(?:\d{1,3})(?:\.\d{1,2})?$/.test(valor),
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
  })
  /* Solamente permite que una de las dos propiedades esté definida. 
  El path indica dónde asociar el mensaje de error. */
  .refine(
    ({ rutinaEjercicioId, ejercicioId }) =>
      (rutinaEjercicioId === undefined) !== (ejercicioId === undefined),
    {
      message:
        "Cada ejercicio debe tener un identificador de asociación o de ejercicio nuevo, pero no ambos.",
      path: ["ejercicioId"],
    },
  );

export const modificarRutinaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre de la rutina es obligatorio.")
    .max(100, "El nombre no puede superar los 100 caracteres."),

  ejercicios: z
    .array(ejercicioRutinaSchema)
    .min(1, "La rutina debe contener al menos un ejercicio."),
});

export default modificarRutinaSchema;
