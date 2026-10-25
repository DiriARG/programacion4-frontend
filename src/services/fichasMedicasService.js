import { api } from "./api";

const crearParametrosConsulta = (filtros = {}) =>
  Object.fromEntries(
    Object.entries(filtros).filter(
      ([, valor]) => valor !== "" && valor !== null && valor !== undefined,
    ),
  );

export const fichasMedicasService = {
  consultarHistorial: (filtros) =>
    api
      .get("/api/fichas-medicas", {
        params: crearParametrosConsulta(filtros),
      })
      .then((res) => res.data),
};

export default fichasMedicasService;
