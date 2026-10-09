import { api } from "./api";

export const turnosService = {
  consultarTurnos: () => api.get("/api/turnos").then((res) => res.data),
  consultarTurno: (id) => api.get(`/api/turnos/${id}`).then((res) => res.data),
};
