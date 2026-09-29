import { usuariosService } from "../services/usuariosService";

export const crearUsuarioPorRol = {
  ALUMNO: usuariosService.crearAlumno,
  PROFESOR: usuariosService.crearProfesor,
  ADMIN_GESTION: usuariosService.crearAdminGestion,
};
