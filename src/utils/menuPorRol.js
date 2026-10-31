export const menuPorRol = {
  ALUMNO: [{ clave: "perfil", etiqueta: "Mi perfil" }],

  PROFESOR: [
    { clave: "perfil", etiqueta: "Mi perfil" },
    {
      clave: "asistencias",
      etiqueta: "Asistencias",
      ruta: "/asistencias",
    },
    {
      clave: "rutinas",
      etiqueta: "Rutinas",
      ruta: "/rutinas",
    },
  ],

  ADMIN_GESTION: [
    { clave: "perfil", etiqueta: "Mi perfil" },
    {
      clave: "alumnos",
      etiqueta: "Alumnos",
      ruta: "/usuarios/alumnos",
    },
    {
      clave: "turnos",
      etiqueta: "Turnos",
      ruta: "/turnos",
    },
    {
      clave: "asistencias",
      etiqueta: "Asistencias",
      ruta: "/asistencias",
    },
  ],

  ADMIN_GENERAL: [
    { clave: "perfil", etiqueta: "Mi perfil" },
    {
      clave: "alumnos",
      etiqueta: "Alumnos",
      ruta: "/usuarios/alumnos",
    },
    {
      clave: "profesores",
      etiqueta: "Profesores",
      ruta: "/usuarios/profesores",
    },
    {
      clave: "admin-gestion",
      etiqueta: "Administradores de gestión",
      ruta: "/usuarios/admin-gestion",
    },
    {
      clave: "planes",
      etiqueta: "Planes",
      ruta: "/planes",
    },
    {
      clave: "turnos",
      etiqueta: "Turnos",
      ruta: "/turnos",
    },
    {
      clave: "fichas-medicas",
      etiqueta: "Fichas médicas",
      ruta: "/fichas-medicas",
    },
    {
      clave: "asistencias",
      etiqueta: "Asistencias",
      ruta: "/asistencias",
    },
  ],
};
