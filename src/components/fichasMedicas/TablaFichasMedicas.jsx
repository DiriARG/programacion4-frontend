import { useState } from "react";
import { Button, Pagination, Table, Chip } from "@heroui/react";
import { formatearFecha } from "../../utils/formatearDiaYHora";

export function TablaFichasMedicas({
  fichasMedicas = [],
  paginaActual = 0,
  totalPaginas = 0,
  totalElementos = 0,
  registrosPorPagina = 10,
  onCambiarPagina,
}) {
  const [observacionesExpandidas, setObservacionesExpandidas] = useState(
    () => new Set(),
  );

  const indiceInicial =
    totalElementos === 0 ? 0 : paginaActual * registrosPorPagina + 1;

  const indiceFinal = Math.min(
    (paginaActual + 1) * registrosPorPagina,
    totalElementos,
  );

  const alternarObservacion = (id) => {
    setObservacionesExpandidas((actuales) => {
      // Se crea una copia para no modificar directamente el estado anterior.
      const nuevas = new Set(actuales);

      /* Si la ficha ya está expandida, se contrae. 
      Si esta contraída, se agrega su ID para expandirla. */
      if (nuevas.has(id)) {
        nuevas.delete(id);
      } else {
        nuevas.add(id);
      }

      // React actualiza el estado con el nuevo conjunto.
      return nuevas;
    });
  };

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Listado de fichas médicas">
          <Table.Header>
            <Table.Column isRowHeader>Alumno</Table.Column>
            <Table.Column>Registro / actualización</Table.Column>
            <Table.Column>Vencimiento</Table.Column>
            <Table.Column>Observaciones</Table.Column>
          </Table.Header>

          <Table.Body
            items={fichasMedicas}
            renderEmptyState={() => (
              <p className="py-6 text-center text-sm text-hierro-400">
                No hay fichas médicas que coincidan con los filtros.
              </p>
            )}
          >
            {(ficha) => {
              /* Se obtiene la observación sin espacios al principio o al final. 
              Si es null, undefined o queda vacía, se utiliza una cadena vacía. */
              const observacion = ficha.observaciones?.trim() ?? "";
              // Se comprueba si esta ficha está incluida en el conjunto de filas expandidas.
              const observacionExpandida = observacionesExpandidas.has(
                ficha.id,
              );

              return (
                <Table.Row id={ficha.id}>
                  <Table.Cell>
                    <div className="min-w-36">
                      <p className="text-sm text-hueso">
                        {ficha.alumnoNombre} {ficha.alumnoApellido}
                      </p>

                      <p className="mt-1 text-xs text-hierro-400">
                        DNI: {ficha.alumnoDni || "—"}
                      </p>
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <span className="whitespace-nowrap text-sm text-hueso">
                      {formatearFecha(ficha.fechaActualizacion)}
                    </span>
                  </Table.Cell>


                  <Table.Cell>
                    <div className="min-w-32 space-y-2">
                      <p className="whitespace-nowrap text-sm text-hueso">
                        {formatearFecha(ficha.fechaVencimiento)}
                      </p>

                      <Chip
                        variant="soft"
                        color={
                          ficha.estado === "VIGENTE"
                            ? "success"
                            : "danger"
                        }
                      >
                        {ficha.estado === "VIGENTE" ? "Vigente" : "Vencida"}
                      </Chip>
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    {observacion ? (
                      // Se limita el ancho para que las observaciones no ensanchen la tabla.
                      <div className="max-w-xs">
                        <p
                          className={`break-words text-sm text-hierro-200 ${
                            // Contrae el texto a dos líneas, salvo que el usuario lo expanda.
                            observacionExpandida ? "" : "line-clamp-2"
                          }`}
                        >
                          {observacion}
                        </p>

                        {observacion.length > 70 ? (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="mt-1"
                            // Informa si el contenido de esta fila está expandido.
                            aria-expanded={observacionExpandida}
                            // Cambia el estado únicamente para esta ficha.
                            onPress={() => alternarObservacion(ficha.id)}
                          >
                            {observacionExpandida
                              ? "Ver menos"
                              : "Ver completa"}
                          </Button>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-sm text-hierro-400">
                        Sin observaciones
                      </span>
                    )}
                  </Table.Cell>
                </Table.Row>
              );
            }}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>

      {totalPaginas > 1 ? (
        <Table.Footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Pagination>
            <Pagination.Summary>
              Mostrando {indiceInicial}-{indiceFinal} de {totalElementos} fichas
              médicas
            </Pagination.Summary>

            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  aria-label="Página anterior"
                  isDisabled={paginaActual === 0}
                  onPress={() => onCambiarPagina(Math.max(0, paginaActual - 1))}
                >
                  <Pagination.PreviousIcon />
                </Pagination.Previous>
              </Pagination.Item>

              {Array.from({ length: totalPaginas }, (_, indice) => indice).map(
                (pagina) => (
                  <Pagination.Item key={pagina}>
                    <Pagination.Link
                      aria-label={`Página ${pagina + 1}`}
                      isActive={paginaActual === pagina}
                      onPress={() => onCambiarPagina(pagina)}
                    >
                      {pagina + 1}
                    </Pagination.Link>
                  </Pagination.Item>
                ),
              )}

              <Pagination.Item>
                <Pagination.Next
                  aria-label="Página siguiente"
                  isDisabled={paginaActual === totalPaginas - 1}
                  onPress={() =>
                    onCambiarPagina(
                      Math.min(totalPaginas - 1, paginaActual + 1),
                    )
                  }
                >
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </Table.Footer>
      ) : null}
    </Table>
  );
}

export default TablaFichasMedicas;
