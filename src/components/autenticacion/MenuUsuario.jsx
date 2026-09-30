import { useState } from "react";
import { Dropdown } from "@heroui/react";
import { IconChevronDown, IconLogout, IconUser } from "@tabler/icons-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

import { useAutenticacion } from "../../context/AutenticacionContext";
import { menuPorRol } from "../../utils/menuPorRol";
import { etiquetasRol } from "../../utils/etiquetasRol";
import { PerfilModal } from "../modales/PerfilModal";

export function MenuUsuario() {
  const [perfilModalAbierto, setPerfilModalAbierto] = useState(false);

  const { usuario, rol, cerrarSesion } = useAutenticacion();

  const navigate = useNavigate();
  // Se obtiene las opciones disponibles para el rol actual.
  const opcionesMenu = menuPorRol[rol] ?? [];

  // Se construye el nombre completo y utiliza el email o un texto genérico como respaldo.
  const nombreUsuario =
    [usuario?.nombre, usuario?.apellido].filter(Boolean).join(" ") ||
    usuario?.email ||
    "Mi cuenta";

  // Traduce el rol interno a su nombre visible en la interfaz (ADMIN_GENERAL --> Administrador general).
  const etiquetaRol = etiquetasRol[rol] ?? "";

  // Función que se ejecuta cuando se selecciona algo del "Dropdown".
  const manejarAccion = (clave) => {
    if (clave === "cerrar-sesion") {
      cerrarSesion();

      toast.success("Sesión cerrada");
      return;
    }

    if (clave === "perfil") {
      setPerfilModalAbierto(true);
      return;
    }

    const opcion = opcionesMenu.find((item) => item.clave === clave);

    if (opcion?.ruta) {
      navigate(opcion.ruta);
      return;
    }
    
    toast.info(opcion?.etiqueta ?? "Sección", {
      description: "Sección en construcción. Muy pronto vas a poder usarla.",
    });
  };

  return (
    <>
      <Dropdown>
        <Dropdown.Trigger
          aria-label="Menú de usuario"
          className="flex items-center gap-2 border border-hierro-700 px-3 py-2 font-titulos text-sm tracking-[0.16em] text-hueso uppercase transition-colors hover:border-azul-600"
        >
          <IconUser size={18} className="text-azul-500" />

          <span className="max-w-[9rem] truncate normal-case tracking-normal">
            {nombreUsuario}
          </span>

          <IconChevronDown size={16} className="text-hierro-400" />
        </Dropdown.Trigger>

        <Dropdown.Popover placement="bottom end" className="min-w-60">
          <div className="border-b border-hierro-800 px-3 pt-1 pb-3">
            <p className="truncate text-sm text-hueso">{nombreUsuario}</p>

            <p className="etiqueta text-azul-500">{etiquetaRol}</p>
          </div>

          <Dropdown.Menu
            onAction={manejarAccion}
            aria-label="Funcionalidades de la cuenta"
          >
            {opcionesMenu.map((opcion) => (
              <Dropdown.Item
                key={opcion.clave}
                id={opcion.clave}
                textValue={opcion.etiqueta}
              >
                {opcion.etiqueta}
              </Dropdown.Item>
            ))}

            <Dropdown.Item
              key="cerrar-sesion"
              id="cerrar-sesion"
              textValue="Cerrar sesión"
            >
              <span className="flex items-center gap-2">
                <IconLogout size={16} />
                Cerrar sesión
              </span>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      <PerfilModal
        isOpen={perfilModalAbierto}
        onOpenChange={setPerfilModalAbierto}
      />
    </>
  );
}

export default MenuUsuario;
