export const menuPorRol = {
  ALUMNO: [{ clave: "perfil", etiqueta: "Mi perfil" }],

  PROFESOR: [{ clave: "perfil", etiqueta: "Mi perfil" }],

  ADMIN_GESTION: [
    { clave: "perfil", etiqueta: "Mi perfil" },
    {
      clave: "alumnos",
      etiqueta: "Alumnos",
      ruta: "/usuarios/alumnos",
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
  ],
};