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
};

export default rutinasService;
