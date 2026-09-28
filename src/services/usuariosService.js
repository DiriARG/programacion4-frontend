import { api } from "./api";

export const usuariosService = {
  crearAlumno: (data) =>
    api.post("/api/usuarios/alumnos", data).then((res) => res.data),

  crearProfesor: (data) =>
    api.post("/api/usuarios/profesores", data).then((res) => res.data),

  crearAdminGestion: (data) =>
    api.post("/api/usuarios/admin-gestion", data).then((res) => res.data),
};