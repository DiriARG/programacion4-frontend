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
    modificar: usuariosService.modificarAlumno,
    rolCrear: "ALUMNO",
  },

  profesores: {
    titulo: "Profesores",
    consultar: usuariosService.consultarProfesores,
    modificar: usuariosService.modificarProfesor,
    rolCrear: "PROFESOR",
  },

  "admin-gestion": {
    titulo: "Administradores de gestión",
    consultar: usuariosService.consultarAdministradoresGestion,
    modificar: usuariosService.modificarAdminGestion,
    rolCrear: "ADMIN_GESTION",
  },
};
