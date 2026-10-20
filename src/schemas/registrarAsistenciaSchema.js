import { z } from "zod";

// Comprueba que la fecha tenga el formato año-mes-día.
const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;
const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;

const fechaCalendarioValida = (fecha) => {
  // Si la fecha no respeta el formato esperado...
  if (!formatoFecha.test(fecha)) return false;

  // Separa el año, mes y día, y convierte cada parte en un número.
  const [anio, mes, dia] = fecha.split("-").map(Number);
  // Se resta 1 al mes porque JS numera los meses de 0 a 11.
  const fechaConstruida = new Date(Date.UTC(anio, mes - 1, dia));

  // Se valida que la fecha sea real.
  return (
    fechaConstruida.getUTCFullYear() === anio &&
    fechaConstruida.getUTCMonth() === mes - 1 &&
    fechaConstruida.getUTCDate() === dia
  );
};

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
    .refine(fechaCalendarioValida, "Ingresá una fecha válida."),

  hora: z
    .string()
    .min(1, "La hora de la asistencia es obligatoria.")
    .refine((valor) => formatoHora.test(valor), "Ingresá una hora válida."),
});
