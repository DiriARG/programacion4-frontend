import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@heroui/react";
import { useParams } from "react-router";

import { TablaUsuarios } from "../components/comunes/TablaUsuarios";
import { configuracionUsuarios } from "../utils/configuracionUsuarios";
import { PaginaNoEncontrada } from "./NoEncontrado";

export function PaginaUsuarios() {
  const { tipo } = useParams();

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

  return (
    <main className="min-h-screen bg-hierro-950 pt-10 pb-16">
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="etiqueta text-azul-500">Gestión de usuarios</p>

          <h1 className="heading-xl mt-3 text-hueso">
            {configuracion.titulo}
          </h1>

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
              <TablaUsuarios usuarios={usuarios} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default PaginaUsuarios;