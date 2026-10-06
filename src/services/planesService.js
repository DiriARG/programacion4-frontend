import { api } from "./api";

export const planesService = {
  planesActivos: () => api.get("/api/planes/activos").then((res) => res.data),
  consultarPlanes: () => api.get("/api/planes").then((res) => res.data),
  crearPlan: (data) => api.post("/api/planes", data).then((res) => res.data),
  modificarPlan: (id, data) =>
    api.put(`/api/planes/${id}`, data).then((res) => res.data),
  desactivarPlan: (id) =>
    api.patch(`/api/planes/${id}/desactivar`).then((res) => res.data),

  reactivarPlan: (id) =>
    api.patch(`/api/planes/${id}/reactivar`).then((res) => res.data),
};
