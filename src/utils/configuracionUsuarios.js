import { usuariosService } from "../services/usuariosService";

export const crearUsuarioPorRol = {
  ALUMNO: usuariosService.crearAlumno,
  PROFESOR: usuariosService.crearProfesor,
  ADMIN_GESTION: usuariosService.crearAdminGestion,
};

export const configuracionUsuarios = {
  alumnos: {
    titulo: "Alumnos",
    consultar: usuariosService.consultarAlumnos,
  },

  profesores: {
    titulo: "Profesores",
    consultar: usuariosService.consultarProfesores,
  },

  "admin-gestion": {
    titulo: "Administradores de gestión",
    consultar: usuariosService.consultarAdministradoresGestion,
  },
};