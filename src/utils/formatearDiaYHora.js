export const nombresDias = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
};

export const formatearDiaSemana = (dia) => nombresDias[dia] ?? dia;

// El back devuelve por ej: 18:00:00, se recorta a 18:00.
export const formatearHora = (hora) => hora?.slice(0, 5) ?? "";

// Formatea la fecha ej: 2026-10-19 a 19/10/2026.
export const formatearFecha = (fecha) => {
  if (!fecha) return "—";

  const [anio, mes, dia] = fecha.split("-");

  if (!anio || !mes || !dia) return fecha;

  return `${dia}/${mes}/${anio}`;
};