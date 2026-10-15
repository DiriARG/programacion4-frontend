import { api } from "./api";

export const turnosService = {
  consultarTurnos: () => api.get("/api/turnos").then((res) => res.data),
  consultarTurno: (id) => api.get(`/api/turnos/${id}`).then((res) => res.data),
  crearTurno: (data) => api.post("/api/turnos", data).then((res) => res.data),
  modificarTurno: (id, data) =>
    api.put(`/api/turnos/${id}`, data).then((res) => res.data),
  desactivarTurno: (id) =>
    api.patch(`/api/turnos/${id}/desactivar`).then((res) => res.data),
  reactivarTurno: (id) =>
    api.patch(`/api/turnos/${id}/reactivar`).then((res) => res.data),
  inscribirAlumno: (turnoId, alumnoId) =>
    api
      .post(`/api/turnos/${turnoId}/alumnos/${alumnoId}`)
      .then((res) => res.data),

  quitarAlumno: (turnoId, alumnoId) =>
    api
      .delete(`/api/turnos/${turnoId}/alumnos/${alumnoId}`)
      .then((res) => res.data),
};
