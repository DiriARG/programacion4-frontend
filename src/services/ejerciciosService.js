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

  consultarEjerciciosActivos: () =>
    api.get("/api/ejercicios/activos").then((res) => res.data),

  consultarImagenEjercicio: (ejercicioId) =>
    api
      .get(`/api/ejercicios/${ejercicioId}/imagen`, {
        responseType: "blob",
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

  modificarEjercicio: (ejercicioId, data) => {
    /* Comprueba si el admin seleccionó un archivo nuevo:
    Si no seleccionó una imagen, data.imagen vale null --> false.
    Si seleccionó una imagen, data.imagen contiene un objeto File --> true. */
    const tieneImagenNueva = Boolean(data.imagen);

    const datos = {
      nombre: data.nombre,
      grupoMuscular: data.grupoMuscular,
      ...(data.descripcion ? { descripcion: data.descripcion } : {}),
      ...(tieneImagenNueva ? { imagen: data.imagen } : {}),
      /* Si hay una imagen nueva, no se solicita su eliminación porque se reemplazará a la anterior.
      Caso contrario, respeta la decisión del admin de conservarla (false) o eliminarla (true).*/
      eliminarImagen: tieneImagenNueva ? false : data.eliminarImagen,
    };

    return api
      .put(`/api/ejercicios/${ejercicioId}`, toFormData(datos))
      .then((res) => res.data);
  },
};

export default ejerciciosService;
