import { api } from "./api";

export const autenticacionService = {
  login: (data) => api.post("/api/auth/login", data).then((res) => res.data),
};
