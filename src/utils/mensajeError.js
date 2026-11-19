export function mensajeDeError(error, porDefecto) {
  const data = error.response?.data;

  // Sin respuesta del servidor: backend caído, CORS o timeout.
  if (!error.response) {
    return error.code === "ECONNABORTED"
      ? "El servidor tardó demasiado en responder."
      : "No se pudo conectar con el servidor.";
  }

  // Errores de @Valid: se muestran los mensajes de cada campo.
  if (data?.erroresValidacion) {
    return Object.values(data.erroresValidacion).join(" · ");
  }

  return data?.mensaje || porDefecto;
}