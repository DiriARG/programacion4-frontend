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
    desactivar: usuariosService.desactivarAlumno,
    reactivar: usuariosService.reactivarAlumno,
    rolCrear: "ALUMNO",
  },

  profesores: {
    titulo: "Profesores",
    consultar: usuariosService.consultarProfesores,
    modificar: usuariosService.modificarProfesor,
    desactivar: usuariosService.desactivarProfesor,
    reactivar: usuariosService.reactivarProfesor,
    rolCrear: "PROFESOR",
  },

  "admin-gestion": {
    titulo: "Administradores de gestión",
    consultar: usuariosService.consultarAdministradoresGestion,
    modificar: usuariosService.modificarAdminGestion,
    desactivar: usuariosService.desactivarAdminGestion,
    reactivar: usuariosService.reactivarAdminGestion,
    rolCrear: "ADMIN_GESTION",
  },
};
