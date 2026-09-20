import { api } from "./api";

export const planesService = {
  planesActivos: () => api.get("/api/planes/activos").then((res) => res.data),
};
