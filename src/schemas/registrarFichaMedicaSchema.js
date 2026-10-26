import { z } from "zod";

const TAMANIO_MAXIMO_ARCHIVO = 5 * 1024 * 1024;

const TIPOS_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png"];

const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

// Comprueba que la fecha exista en el calendario.
const fechaCalendarioValida = (fecha) => {
  if (!formatoFecha.test(fecha)) return false;

  const [anio, mes, dia] = fecha.split("-").map(Number);
  const fechaConstruida = new Date(Date.UTC(anio, mes - 1, dia));

  return (
    fechaConstruida.getUTCFullYear() === anio &&
    fechaConstruida.getUTCMonth() === mes - 1 &&
    fechaConstruida.getUTCDate() === dia
  );
};

/* Se comprueba que el valor recibido sea realmente un archivo File (objeto que representa un archivo) del navegador, y no una cadena,  otro objeto o cualquier dato.
También se verifica que File exista antes de utilizarlo para evitar errores en entornos donde esa API File no esté disponible. */
const esArchivo = (valor) =>
  typeof File !== "undefined" && valor instanceof File;

// z.preprocess permite transformar el valor recibido antes de que Zod ejucute las validaciones del schema.
const certificadoSchema = z.preprocess(
  (valor) => {
    // FileList contiene los archivos seleccionados en el input.
    if (typeof FileList !== "undefined" && valor instanceof FileList) {
      // Solo se permite seleccionar un solo archivo, así que se obtiene el primero de la lista.
      return valor.item(0) ?? undefined;
    }

    // Si el valor ya es un File, o no es un FileList, se lo deja como está para que lo valide el schema.
    return valor;
  },
  
  // Una vez preparado el valor, Zod ejecuta estas validaciones.
    z.custom(esArchivo, "Seleccioná un certificado médico.")
    .refine(
      (archivo) => esArchivo(archivo) && archivo.size > 0,
      "El archivo no puede estar vacío.",
    )
    .refine(
      (archivo) => esArchivo(archivo) && archivo.size <= TAMANIO_MAXIMO_ARCHIVO,
      "El certificado no puede superar los 5 MB.",
    )
    .refine(
      (archivo) =>
        esArchivo(archivo) &&
        (TIPOS_PERMITIDOS.includes(archivo.type) ||
          /\.(pdf|jpe?g|png)$/i.test(archivo.name)),
      "El certificado debe ser un archivo PDF, JPG o PNG.",
    ),
);

export const registrarFichaMedicaSchema = z.object({
  alumnoId: z
    .string()
    .trim()
    .min(1, "Seleccioná un alumno.")
    .regex(/^\d+$/, "El alumno seleccionado no es válido.")
    .transform(Number),

  certificado: certificadoSchema,

  fechaVencimiento: z
    .string()
    .min(1, "La fecha de vencimiento es obligatoria.")
    .refine(fechaCalendarioValida, "Ingresá una fecha válida."),

  observaciones: z.string().trim().optional(),
});
