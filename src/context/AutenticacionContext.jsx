import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { autenticacionService } from "../services/autenticacionService";

const AutenticacionContext = createContext(null);

export function AutenticacionProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [sesionCargada, setSesionCargada] = useState(false);

  /* Escenario 1: El usuario entra por primera vez o recarga la página (F5): 
  Acá el navegador ya tiene un token guardado de antes, por lo que el useEffect 
  intenta reconstruir la sesión automáticamente llamando a obtenerPerfil().
  */
  useEffect(() => {
    const cargarSesion = async () => {
      const token = localStorage.getItem("token");

      // Si no hay token, no existe una sesión que recuperar.
      if (!token) {
        setSesionCargada(true);
        return;
      }

      try {
        // Recupera el perfil del usuario asociado al JWT guardado.
        const perfilUsuario = await autenticacionService.obtenerPerfil();
        setUsuario(perfilUsuario);
      } catch {
        // Si el token ya no es válido, elimina la sesión local.
        localStorage.removeItem("token");
        setUsuario(null);
      } finally {
        // Indica que terminó la comprobación inicial de la sesión.
        setSesionCargada(true);
      }
    };

    cargarSesion();
  }, []);

  /*  Escenario 2: Accíon activa de inicio de sesión:
      Este método se ejecuta exclusivamente cuando el usuario llena el formulario 
      de login y hace clic en "Iniciar sesión". 
      Como el backend devuelve tanto el token como los datos del usuario en el "LoginResponse", aquí obtenemos todo de golpe. Por lo tanto,
      NUNCA se llama a obtenerPerfil() en este flujo. Las peticiones son excluyentes.
      useCallback: Memoriza la función para mantener la misma referencia entre renderizados. Esto ayuda a mantener estable el valor del contexto mientras sus dependencias no cambien.
  */
  const iniciarSesion = useCallback(async (data) => {
    const respuesta = await autenticacionService.login(data);

    // Guarda el JWT para autorizar las siguientes peticiones.
    localStorage.setItem("token", respuesta.token);

    // Extracción de los datos del usuario.
    const usuarioAutenticado = {
      id: respuesta.id,
      nombre: respuesta.nombre,
      apellido: respuesta.apellido,
      email: respuesta.email,
      rol: respuesta.rol,
    };

    // Actualiza inmediatamente el usuario en el estado de React.
    setUsuario(usuarioAutenticado);

    return respuesta;
  }, []);

  const cerrarSesion = useCallback(() => {
    // Elimina el JWT y la información del usuario de React.
    localStorage.removeItem("token");
    setUsuario(null);
  }, []);

  /* 
    - useMemo: Memoriza este objeto que expone el contexto para evitar recrearlo cuando ninguno de sus valores haya cambiado (los que están dentro de los corchetes del final).
    - rol: usuario?.rol ?? null --> Si el usuario existe, extrae su rol; si es null (no está logueado), devuelve null.
    - estaAutenticado: Boolean(usuario) --> Transforma el objeto usuario en un booleano rápido (true si hay usuario, false si es null).
  */
  const valorContexto = useMemo(
    () => ({
      usuario,
      rol: usuario?.rol ?? null,
      estaAutenticado: Boolean(usuario),
      sesionCargada,
      iniciarSesion,
      cerrarSesion,
    }),
    [usuario, sesionCargada, iniciarSesion, cerrarSesion],
  );

  // Entrega el objeto valorContexto (con el usuario y las funciones) a todos los componentes hijos que estén envueltos en este proveedor.
  return (
    <AutenticacionContext.Provider value={valorContexto}>
      {children}
    </AutenticacionContext.Provider>
  );
}

/* 
  Hook personalizado para consumir el contexto de autenticación de forma limpia.
  Evita tener que importa "useContext" y AutenticacionContext en cada componente donde se necesite la sesión.
  Simplemente se hace:
  const { iniciarSesion } = useAutenticacion();
  */
export function useAutenticacion() {
  const contexto = useContext(AutenticacionContext);

  if (!contexto) {
    throw new Error(
      "useAutenticacion debe usarse dentro de <AutenticacionProvider>.",
    );
  }

  return contexto;
}

export default AutenticacionContext;
