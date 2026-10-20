import { api } from "./api";

// Omite los filtros vacíos para enviar solo los criterios elegidos.
const crearParametrosConsulta = (filtros = {}) =>
  Object.fromEntries(
    Object.entries(filtros).filter(
      ([, valor]) => valor !== "" && valor !== null && valor !== undefined,
    ),
  );

export const asistenciasService = {
  consultarHistorialAdministrativo: (filtros) =>
    api
      .get("/api/asistencias", {
        params: crearParametrosConsulta(filtros),
      })
      .then((res) => res.data),

  consultarHistorialProfesor: (filtros) =>
    api
      .get("/api/profesores/asistencias", {
        params: crearParametrosConsulta(filtros),
      })
      .then((res) => res.data),

  registrarAsistencia: (data) =>
    api.post("/api/asistencias", data).then((res) => res.data),
};
