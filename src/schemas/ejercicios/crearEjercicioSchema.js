import { z } from "zod";

const TAMANIO_MAXIMO_IMAGEN = 5 * 1024 * 1024;

const TIPOS_IMAGEN_PERMITIDOS = ["image/jpeg", "image/png"];

const esArchivo = (valor) =>
  typeof File !== "undefined" && valor instanceof File;

const imagenOpcionalSchema = z.preprocess(
  (valor) => {
    // Convierte los valores nulos (como el que manda setValue en el modal) en undefined para las validaciones. 
    if (valor === null || valor === undefined) {
      return undefined;
    }

    if (typeof FileList !== "undefined" && valor instanceof FileList) {
      return valor.item(0) ?? undefined;
    }

    return valor;
  },

  z
    .custom(
      (valor) => valor === undefined || esArchivo(valor),
      "La imagen seleccionada no es válida.",
    )
    .refine(
      (archivo) =>
        archivo === undefined || (esArchivo(archivo) && archivo.size > 0),
      "La imagen no puede estar vacía.",
    )
    .refine(
      (archivo) =>
        archivo === undefined ||
        (esArchivo(archivo) && archivo.size <= TAMANIO_MAXIMO_IMAGEN),
      "La imagen no puede superar los 5 MB.",
    )
    .refine(
      (archivo) =>
        archivo === undefined ||
        (esArchivo(archivo) &&
          (TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type) ||
            /\.(jpe?g|png)$/i.test(archivo.name))),
      "La imagen debe ser un archivo JPG o PNG.",
    ),
);

export const crearEjercicioSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre del ejercicio es obligatorio.")
    .max(100, "El nombre no puede superar los 100 caracteres."),

  grupoMuscular: z
    .string()
    .trim()
    .min(1, "El grupo muscular es obligatorio.")
    .max(50, "El grupo muscular no puede superar los 50 caracteres."),

  descripcion: z
    .string()
    .trim()
    .optional()
    // La descripción vacía se transforma en undefined. Se evita enviar una cadena vacía al back.
    .transform((valor) => valor || undefined),

  // También la imagen puede ser undefined ya que no es obligatoria.
  imagen: imagenOpcionalSchema,
});
