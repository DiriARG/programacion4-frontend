import { toFormData } from "axios";
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

  crearEjercicio: (data) => {
    const datos = {
      nombre: data.nombre,
      grupoMuscular: data.grupoMuscular,

      ...(data.descripcion ? { descripcion: data.descripcion } : {}),
      ...(data.imagen ? { imagen: data.imagen } : {}),
    };

    return api
      .post("/api/ejercicios", toFormData(datos))
      .then((res) => res.data);
  },
};

export default ejerciciosService;
