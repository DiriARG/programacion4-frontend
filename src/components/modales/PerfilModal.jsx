import { useQuery } from "@tanstack/react-query";
import { Button, Chip, Modal, Spinner } from "@heroui/react";

import { autenticacionService } from "../../services/autenticacionService";

const etiquetasRol = {
  ALUMNO: "Alumno",
  PROFESOR: "Profesor",
  ADMIN_GESTION: "Administrador de gestión",
  ADMIN_GENERAL: "Administrador general",
};

/* Componente reutilizable para mostrar un dato del perfil.
Recibe una etiqueta (ej "Nombre") y su valor, evitando repetir la misma estructura JSX para cada dato. */
function DatoPerfil({ etiqueta, valor }) {
  return (
    <div className="border-b border-hierro-800 pb-3">
      <p className="etiqueta text-hierro-400">{etiqueta}</p>
      <p className="mt-1 break-words text-sm text-hueso">{valor}</p>
    </div>
  );
}

/* isOpen y onOpenChange son props de HeroUI utilizadas por Modal.Backdrop.
isOpen --> Indica si el modal está abierto.
onOpenChange --> Función que se ejucta cuando cambia el estado de apertura del modal, ej, al cerrarlo. */
export function PerfilModal({ isOpen, onOpenChange }) {
  const {
    data: perfil,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["perfil-propio"],
    queryFn: autenticacionService.obtenerPerfil,
    // Esto hace que React Query no consulte /api/usuarios/perfil mientras el modal está cerrado.
    enabled: isOpen,
  });

  const etiquetaRol = etiquetasRol[perfil?.rol] ?? perfil?.rol ?? "—";

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant="blur"
      >
        <Modal.Container size="md" placement="center">
          <Modal.Dialog
            aria-labelledby="perfil-titulo"
            className="border border-hierro-700 bg-hierro-900"
          >
            <Modal.Header className="border-b border-hierro-800">
              <div>
                <Modal.Heading
                  id="perfil-titulo"
                  className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                >
                  Mi perfil
                </Modal.Heading>

                <p className="mt-1 text-sm text-hierro-400">
                  Información de tu cuenta
                </p>
              </div>
            </Modal.Header>

            <Modal.Body className="pt-6 pb-0">
              {isPending ? (
                <div className="flex min-h-56 items-center justify-center">
                  <div className="flex items-center gap-3 text-sm text-hierro-300">
                    <Spinner size="sm" />
                    Cargando perfil...
                  </div>
                </div>
              ) : isError ? (
                <div className="flex min-h-56 flex-col items-center justify-center gap-4 text-center">
                  <div>
                    <p className="font-titulos text-lg tracking-wide text-hueso uppercase">
                      No pudimos cargar tu perfil
                    </p>

                    <p className="mt-1 text-sm text-hierro-400">
                      Ocurrió un problema al consultar tus datos.
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={() => refetch()}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : (
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <DatoPerfil
                    etiqueta="Nombre"
                    valor={perfil?.nombre ?? "No registrado"}
                  />

                  <DatoPerfil
                    etiqueta="Apellido"
                    valor={perfil?.apellido ?? "No registrado"}
                  />

                  <DatoPerfil
                    etiqueta="DNI"
                    valor={perfil?.dni ?? "No registrado"}
                  />

                  <DatoPerfil
                    etiqueta="Email"
                    valor={perfil?.email ?? "No registrado"}
                  />

                  <DatoPerfil
                    etiqueta="Teléfono"
                    valor={perfil?.telefono ?? "No registrado"}
                  />

                  <DatoPerfil etiqueta="Rol" valor={etiquetaRol} />

                  <div className="border-b border-hierro-800 pb-3 sm:col-span-2">
                    <p className="etiqueta text-hierro-400">
                      Estado de la cuenta
                    </p>

                    <div className="mt-2">
                      <Chip
                        color={perfil?.activo ? "success" : "danger"}
                        variant="soft"
                        size="sm"
                      >
                        {perfil?.activo ? "Activa" : "Inactiva"}
                      </Chip>
                    </div>
                  </div>
                </div>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="secondary"
                size="md"
                onPress={() => onOpenChange(false)}
              >
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

export default PerfilModal;
