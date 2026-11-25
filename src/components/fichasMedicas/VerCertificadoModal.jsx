import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Modal, Spinner } from "@heroui/react";

import { fichasMedicasService } from "../../services/fichasMedicasService";

const TIPOS_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png"];

// Obtiene el mensaje del backend, incluso cuando Axios recibe un Blob.
const obtenerMensajeErrorCertificado = async (error) => {
  const respuesta = error?.response?.data;

  if (typeof Blob !== "undefined" && respuesta instanceof Blob) {
    try {
      const datos = JSON.parse(await respuesta.text());

      return (
        datos?.mensaje ??
        "Ocurrió un problema al recuperar el certificado médico."
      );
    } catch {
      return "Ocurrió un problema al recuperar el certificado médico.";
    }
  }

  return (
    respuesta?.mensaje ??
    "Ocurrió un problema al recuperar el certificado médico."
  );
};

export function VerCertificadoModal({ isOpen, onOpenChange, ficha }) {
  const [urlCertificado, setUrlCertificado] = useState("");

  const {
    data: certificado,
    isPending,
    isFetching,
    error,
    refetch,
  } = useQuery({
    // Cada ficha tiene su propia consulta.
    queryKey: ["fichasMedicas", "certificado", ficha?.id],

    queryFn: async () => {
      let archivo;

      try {
        archivo = await fichasMedicasService.consultarCertificado(ficha.id);
      } catch (error) {
        throw new Error(await obtenerMensajeErrorCertificado(error));
      }

      const tipoContenido = archivo.type?.split(";")[0].trim().toLowerCase();

      if (!TIPOS_PERMITIDOS.includes(tipoContenido)) {
        throw new Error(
          "El documento recibido no tiene un formato compatible.",
        );
      }

      return { archivo, tipoContenido };
    },

    // Solo se consulta cuando el modal está abierto y hay una ficha elegida.
    enabled: isOpen && Boolean(ficha?.id),

    retry: false,

    // No se conserva en caché innecesariamente el archivo cuando la consulta queda inactiva.
    gcTime: 0,

    // No se descarga el certificado nuevamente cuando el usuario cambia de pestaña del navegador y vuelve a Iron Empire.
    refetchOnWindowFocus: false,
  });

  const archivo = certificado?.archivo;
  const tipoContenido = certificado?.tipoContenido;

  useEffect(() => {
    if (!isOpen || !archivo) {
      setUrlCertificado("");
      return;
    }

    // Se crea una URL temporal para que el navegador pueda mostrar el archivo.
    const urlTemporal = URL.createObjectURL(archivo);
    // Se guarda la URL para que el iframe o el img pueda utilizarla.
    setUrlCertificado(urlTemporal);

    // Cuando el useEffect se ejecuta se libera la url anterior.
    return () => {
      URL.revokeObjectURL(urlTemporal);
    };
  }, [isOpen, archivo]); // Se ejecuta al abrir/cerrar el modal o cuando cambia el archivo recibido.

  const nombreAlumno = ficha
    ? `${ficha.alumnoNombre} ${ficha.alumnoApellido}`
    : "";

  return (
    <Modal>
      <Modal.Backdrop
        variant="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable
      >
        <Modal.Container placement="center" size="cover" scroll="inside">
          <Modal.Dialog className="flex h-[88vh] w-[95vw] max-w-[1200px] flex-col">
            <Modal.CloseTrigger />

            <Modal.Header>
              <div>
                <Modal.Heading className="font-titulos text-hueso">
                  Certificado médico
                </Modal.Heading>

                <p className="mt-1 text-sm text-hierro-400">
                  Alumno: {nombreAlumno}
                </p>
              </div>
            </Modal.Header>

            <Modal.Body className="min-h-0 flex-1">
              <div className="flex h-full min-h-[55vh] items-center justify-center overflow-auto rounded-lg bg-hierro-900">
                {isPending || (isFetching && !certificado) ? (
                  <div
                    className="flex flex-col items-center gap-3 p-6"
                    role="status"
                  >
                    <Spinner size="lg" />

                    <p className="text-sm text-hierro-400">
                      Cargando certificado médico...
                    </p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center gap-4 p-6 text-center">
                    <p className="text-sm text-danger" role="alert">
                      {error.message}
                    </p>

                    <Button
                      type="button"
                      variant="secondary"
                      onPress={() => refetch()}
                      isDisabled={isFetching}
                    >
                      Reintentar
                    </Button>
                  </div>
                ) : tipoContenido === "application/pdf" && urlCertificado ? (
                  <iframe
                    src={urlCertificado}
                    title={`Certificado médico de ${nombreAlumno}`}
                    className="h-full min-h-[55vh] w-full border-0"
                  />
                ) : urlCertificado ? (
                  <img
                    src={urlCertificado}
                    alt={`Certificado médico de ${nombreAlumno}`}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : null}
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button
                type="button"
                variant="secondary"
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

export default VerCertificadoModal;
