import { api } from "./api";

const crearParametrosConsulta = (filtros = {}) =>
  Object.fromEntries(
    Object.entries(filtros).filter(
      ([, valor]) => valor !== "" && valor !== null && valor !== undefined,
    ),
  );

export const ejerciciosService = {
  consultarEjercicios: (filtros) =>
    api
      .get("/api/ejercicios", {
        params: crearParametrosConsulta(filtros),
      })
      .then((res) => res.data),
};

export default ejerciciosService;
