import { Chip, Pagination, Table } from "@heroui/react";
import { formatearFecha } from "../../utils/formatearDiaYHora";

export function TablaRutinas({
  rutinas = [],
  paginaActual = 0,
  totalPaginas = 0,
  totalElementos = 0,
  registrosPorPagina = 10,
  onCambiarPagina,
}) {
  const indiceInicial =
    totalElementos === 0 ? 0 : paginaActual * registrosPorPagina + 1;

  const indiceFinal = Math.min(
    (paginaActual + 1) * registrosPorPagina,
    totalElementos,
  );

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Listado de rutinas">
          <Table.Header>
            <Table.Column isRowHeader>Alumno</Table.Column>
            <Table.Column>Rutina</Table.Column>
            <Table.Column>Fecha de creación</Table.Column>
            <Table.Column>Estado</Table.Column>
          </Table.Header>

          <Table.Body
            items={rutinas}
            renderEmptyState={() => (
              <p className="py-6 text-center text-sm text-hierro-400">
                No hay rutinas que coincidan con los filtros.
              </p>
            )}
          >
            {(rutina) => (
              <Table.Row id={rutina.id}>
                <Table.Cell>
                  <div className="min-w-36">
                    <p className="text-sm text-hueso">
                      {rutina.alumnoNombre} {rutina.alumnoApellido}
                    </p>

                    <p className="mt-1 text-xs text-hierro-400">
                      DNI: {rutina.alumnoDni || "—"}
                    </p>
                  </div>
                </Table.Cell>

                <Table.Cell>
                  <span className="min-w-36 text-sm text-hueso">
                    {rutina.nombre}
                  </span>
                </Table.Cell>

                <Table.Cell>
                  <span className="whitespace-nowrap text-sm text-hueso">
                    {formatearFecha(rutina.fechaCreacion)}
                  </span>
                </Table.Cell>

                <Table.Cell>
                  <Chip
                    variant="soft"
                    color={rutina.activa ? "success" : "danger"}
                  >
                    {rutina.activa ? "Activa" : "Inactiva"}
                  </Chip>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>

      {totalPaginas > 1 ? (
        <Table.Footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Pagination>
            <Pagination.Summary>
              Mostrando {indiceInicial}-{indiceFinal} de {totalElementos}{" "}
              rutinas
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

export default TablaRutinas;
