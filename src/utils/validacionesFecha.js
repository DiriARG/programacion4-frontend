// Comprueba que la fecha tenga el formato año-mes-día.
const FORMATO_FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

export const esFechaCalendarioValida = (fecha) => {
  // Si la fecha no respeta el formato esperado...
  if (typeof fecha !== "string" || !FORMATO_FECHA_ISO.test(fecha)) {
    return false;
  }

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
