import { api } from "./api";

export const planesService = {
  planesActivos: () => api.get("/api/planes/activos").then((res) => res.data),
  consultarPlanes: () => api.get("/api/planes").then((res) => res.data),
};
