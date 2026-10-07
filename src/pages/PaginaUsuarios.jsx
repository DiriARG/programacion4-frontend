import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Spinner } from "@heroui/react";
import { IconArrowLeft, IconUserPlus } from "@tabler/icons-react";
import { Link, useParams } from "react-router";

import { TablaUsuarios } from "../components/comunes/TablaUsuarios";
import { CrearUsuarioModal } from "../components/modales/CrearUsuarioModal";
import { ModificarUsuarioModal } from "../components/modales/ModificarUsuarioModal";
import { CambioEstadoUsuarioModal } from "../components/modales/CambioEstadoUsuarioModal";
import { configuracionUsuarios } from "../utils/configuracionUsuarios";
import { PaginaNoEncontrada } from "./NoEncontrado";

export function PaginaUsuarios() {
  const { tipo } = useParams();

  const [crearUsuarioModalAbierto, setCrearUsuarioModalAbierto] =
    useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [cambioEstadoUsuario, setCambioEstadoUsuario] = useState(null);

  const configuracion = configuracionUsuarios[tipo];

  const {
    data: usuarios = [],
    isPending,
    isError,
  } = useQuery({
    // Permite que cada listado tenga su propia cache.
    queryKey: ["usuarios", tipo],
    queryFn: configuracion?.consultar,
    // Solo ejecuta la consulta si existe una configuración válida para el tipo de usuario.
    enabled: Boolean(configuracion),
  });

  if (!configuracion) {
    return <PaginaNoEncontrada />;
  }

  const abrirModificarUsuarioModal = (usuario) => {
    // Guarda quién queremos modificar.
    setUsuarioSeleccionado(usuario);
  };

  const abrirCambioEstadoUsuario = (usuario, accion) => {
    setCambioEstadoUsuario({
      usuario,
      accion,
    });
  };

  return (
    <>
      <main className="min-h-screen bg-hierro-950 pt-10 pb-16">
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="relative">
              <Link
                to="/"
                aria-label="Volver al inicio"
                className="mb-6 inline-flex items-center gap-2 font-titulos text-xs tracking-[0.2em] text-hierro-400 uppercase transition-colors hover:text-hueso lg:absolute lg:-left-[250px] lg:top-6 lg:mb-0"
              >
                <IconArrowLeft size={16} />
                Inicio
              </Link>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="etiqueta text-azul-500">Gestión de usuarios</p>

                  <h1 className="heading-xl mt-3 text-hueso">
                    {configuracion.titulo}
                  </h1>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onPress={() => setCrearUsuarioModalAbierto(true)}
                >
                  <IconUserPlus size={18} />
                  Crear
                </Button>
              </div>
            </div>

            <div className="mt-8">
              {isPending ? (
                <div className="flex min-h-60 items-center justify-center">
                  <Spinner size="lg" />
                </div>
              ) : isError ? (
                <div className="surface-plate p-6 text-center">
                  <p className="text-sm text-hierro-200">
                    No se pudo cargar el listado.
                  </p>

                  <p className="mt-2 text-sm text-hierro-400">
                    Ocurrió un problema al consultar los usuarios.
                  </p>
                </div>
              ) : (
                <TablaUsuarios
                  usuarios={usuarios}
                  onModificar={abrirModificarUsuarioModal}
                  onDesactivar={(usuario) =>
                    abrirCambioEstadoUsuario(usuario, "desactivar")
                  }
                  onReactivar={(usuario) =>
                    abrirCambioEstadoUsuario(usuario, "reactivar")
                  }
                />
              )}
            </div>
          </div>
        </section>
      </main>

      <CrearUsuarioModal
        isOpen={crearUsuarioModalAbierto}
        onOpenChange={setCrearUsuarioModalAbierto}
        rolFijo={configuracion.rolCrear}
      />
      <ModificarUsuarioModal
        isOpen={usuarioSeleccionado !== null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setUsuarioSeleccionado(null);
          }
        }}
        usuario={usuarioSeleccionado}
        modificar={configuracion.modificar}
      />
      <CambioEstadoUsuarioModal
        isOpen={cambioEstadoUsuario !== null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setCambioEstadoUsuario(null);
          }
        }}
        usuario={cambioEstadoUsuario?.usuario}
        accion={cambioEstadoUsuario?.accion}
        cambiarEstado={
          cambioEstadoUsuario?.accion === "desactivar"
            ? configuracion.desactivar
            : configuracion.reactivar
        }
      />
    </>
  );
}

export default PaginaUsuarios;
