import { toFormData } from "axios";
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

  consultarAlumnosSinFichaMedica: () =>
    api.get("/api/fichas-medicas/alumnos-sin-ficha").then((res) => res.data),

  registrarFichaMedica: (alumnoId, data) => {
    const datos = {
      certificado: data.certificado,
      fechaVencimiento: data.fechaVencimiento,

      // Se incluye las observaciones solo si contienen texto.
      ...(data.observaciones?.trim()
        ? { observaciones: data.observaciones.trim() }
        : {}),
    };

    return api
      .post(`/api/fichas-medicas/alumnos/${alumnoId}`, toFormData(datos))
      .then((res) => res.data);
  },
};

export default fichasMedicasService;
