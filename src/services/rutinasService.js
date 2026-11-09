import { api } from "./api";

const crearParametrosConsulta = (filtros = {}) =>
  Object.fromEntries(
    Object.entries(filtros).filter(
      ([, valor]) => valor !== "" && valor !== null && valor !== undefined,
    ),
  );

export const rutinasService = {
  consultarRutinas: (filtros) =>
    api
      .get("/api/rutinas", {
        params: crearParametrosConsulta(filtros),
      })
      .then((res) => res.data),

  consultarRutina: (rutinaId) =>
    api.get(`/api/rutinas/${rutinaId}`).then((res) => res.data),

  consultarRutinaActual: () =>
    api.get("/api/rutinas/actual").then((res) => res.data),

  crearRutina: (data) => api.post("/api/rutinas", data).then((res) => res.data),

  modificarRutina: (rutinaId, data) =>
    api.put(`/api/rutinas/${rutinaId}`, data).then((res) => res.data),
};

export default rutinasService;
