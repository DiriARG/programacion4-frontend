import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Separator, Spinner } from "@heroui/react";

import { ejerciciosService } from "../../services/ejerciciosService";

const TIPOS_IMAGEN_PERMITIDOS = ["image/jpeg", "image/png"];

export function TarjetaEjercicioDetalle({ ejercicio }) {
  const [urlImagen, setUrlImagen] = useState("");
  // Indica si el navegador tuvo problemas al mostrar la imagen recibida.
  const [errorVisualizacion, setErrorVisualizacion] = useState(false);

  // Debe tener una imagen (ya que la imagen es opcional) y el ID para consultar su archivo.
  const tieneImagen = Boolean(ejercicio.imagenUrl && ejercicio.ejercicioId);

  const { data: imagen, isPending } = useQuery({
    queryKey: ["imagenesEjercicios", ejercicio.ejercicioId],
    queryFn: async () => {
      const archivo = await ejerciciosService.consultarImagenEjercicio(
        ejercicio.ejercicioId,
      );

      const tipoContenido = archivo.type?.split(";")[0].trim().toLowerCase();

      if (!TIPOS_IMAGEN_PERMITIDOS.includes(tipoContenido)) {
        throw new Error("El formato de imagen recibido no es compatible.");
      }

      return archivo;
    },
    enabled: tieneImagen,
    retry: false,
    // Mantiene la imagen fresca en caché durante cinco minutos, así se evita realizar otras solicitudes al back.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // Al recibir una nueva imagen se pone false para intentar volver a mostrarla.
    setErrorVisualizacion(false);

    // Si el ejercicio ya no tiene imagen (ej, fue eliminada al modificar el ejercicio) o la consolta aún no devolvió el archivo, se limpia la URL temporal.
    if (!tieneImagen || !imagen) {
      setUrlImagen("");
      return;
    }

    const urlTemporal = URL.createObjectURL(imagen);

    setUrlImagen(urlTemporal);

    return () => {
      URL.revokeObjectURL(urlTemporal);
    };
  }, [tieneImagen, imagen]);

  // Existe una URL temporal de la imagen y el navegador no informó un error al mostrarla.
  const mostrarImagen = Boolean(urlImagen) && !errorVisualizacion;

  // Mantiene el spinner activo mientras se descarga la imagen o se procesa su URL temporal.
  const mostrarCarga =
    tieneImagen &&
    (isPending || (Boolean(imagen) && !urlImagen && !errorVisualizacion));

  /* Si tieneImagen es false, el back no informó una imagen para el ejercicio así que se muestra el primer mensaje.
  Si es true, la imagen no pudo recuperarse o mostrarse, se muestra el segundo mensaje.  */
  const mensajeImagen = !tieneImagen ? "Sin imagen" : "Imagen no disponible";

  return (
    <Card
      variant="secondary"
      className="border border-hierro-700 bg-hierro-900"
    >
      <Card.Content className="space-y-4 p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-hierro-700 bg-hierro-950 sm:w-28">
            {mostrarImagen ? (
              <img
                src={urlImagen}
                alt={`Imagen del ejercicio ${ejercicio.ejercicioNombre}`}
                className="h-full w-full object-cover"
                onError={() => setErrorVisualizacion(true)}
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center p-3 text-center"
                role="status"
              >
                {mostrarCarga ? (
                  <Spinner size="sm" />
                ) : (
                  <span className="text-xs text-hierro-400">
                    {mensajeImagen}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-titulos text-base text-hueso">
              {ejercicio.ejercicioNombre}
            </h3>

            <p className="mt-1 text-sm text-hierro-400">
              {ejercicio.grupoMuscular}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-hierro-800 px-3 py-1 text-xs font-medium text-hueso">
                {ejercicio.series} series
              </span>

              <span className="rounded-full bg-hierro-800 px-3 py-1 text-xs font-medium text-hueso">
                {ejercicio.repeticiones} reps
              </span>
            </div>

            <p className="mt-2 text-sm font-semibold text-hueso">
              Peso:{" "}
              {ejercicio.peso == null
                ? "No especificado"
                : `${ejercicio.peso} kg`}
            </p>
          </div>
        </div>

        {ejercicio.descripcion?.trim() ? (
          <>
            <Separator className="bg-hierro-700" />

            <p className="text-sm leading-relaxed text-hierro-300">
              {ejercicio.descripcion}
            </p>
          </>
        ) : null}

        <p className="text-xs text-hierro-400">Orden {ejercicio.orden}</p>
      </Card.Content>
    </Card>
  );
}

export default TarjetaEjercicioDetalle;
