import { api } from "./api";

export const usuariosService = {
  crearAlumno: (data) =>
    api.post("/api/usuarios/alumnos", data).then((res) => res.data),

  crearProfesor: (data) =>
    api.post("/api/usuarios/profesores", data).then((res) => res.data),

  crearAdminGestion: (data) =>
    api.post("/api/usuarios/admin-gestion", data).then((res) => res.data),

  consultarAlumnos: () =>
    api.get("/api/usuarios/alumnos").then((res) => res.data),

  consultarProfesores: () =>
    api.get("/api/usuarios/profesores").then((res) => res.data),

  consultarAdministradoresGestion: () =>
    api.get("/api/usuarios/admin-gestion").then((res) => res.data),

  modificarAlumno: (id, data) =>
    api.put(`/api/usuarios/alumnos/${id}`, data).then((res) => res.data),

  modificarProfesor: (id, data) =>
    api.put(`/api/usuarios/profesores/${id}`, data).then((res) => res.data),

  modificarAdminGestion: (id, data) =>
    api.put(`/api/usuarios/admin-gestion/${id}`, data).then((res) => res.data),

  desactivarAlumno: (id) =>
    api.patch(`/api/usuarios/alumnos/${id}/desactivar`).then((res) => res.data),

  reactivarAlumno: (id) =>
    api.patch(`/api/usuarios/alumnos/${id}/reactivar`).then((res) => res.data),

  desactivarProfesor: (id) =>
    api
      .patch(`/api/usuarios/profesores/${id}/desactivar`)
      .then((res) => res.data),

  reactivarProfesor: (id) =>
    api
      .patch(`/api/usuarios/profesores/${id}/reactivar`)
      .then((res) => res.data),

  desactivarAdminGestion: (id) =>
    api
      .patch(`/api/usuarios/admin-gestion/${id}/desactivar`)
      .then((res) => res.data),

  reactivarAdminGestion: (id) =>
    api
      .patch(`/api/usuarios/admin-gestion/${id}/reactivar`)
      .then((res) => res.data),
};
