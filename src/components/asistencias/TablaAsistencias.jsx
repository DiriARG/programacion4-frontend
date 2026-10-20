import { Pagination, Table } from "@heroui/react";

import { formatearHora } from "../../utils/formatearDiaYHora";
import { etiquetasRol } from "../../utils/etiquetasRol";

// Formatea la fecha ej: 2026-10-19 a 19/10/2026.
const formatearFecha = (fecha) => {
  if (!fecha) return "—";

  const [anio, mes, dia] = fecha.split("-");

  if (!anio || !mes || !dia) return fecha;

  return `${dia}/${mes}/${anio}`;
};

export function TablaAsistencias({
  asistencias = [],
  paginaActual = 0,
  totalPaginas = 0,
  // Representa la cantidad total de asistencias que coinciden con los filtros, contando todas las páginas.
  totalElementos = 0,
  registrosPorPagina = 10,
  onCambiarPagina,
}) {
  /* Se calcula el número del primer registro de la página actual.
  Como se muestra diez asistencias por página ej:
  paginaActual  Operación    Primer registro
  0             0 * 10 + 1   1
  1             0 * 10 + 1   11 
  Si no hay resultados, muestra 0.*/
  const indiceInicial =
    totalElementos === 0 ? 0 : paginaActual * registrosPorPagina + 1;

  // Se calcula el número del último registro de la página actual.
  const indiceFinal = Math.min(
    (paginaActual + 1) * registrosPorPagina,
    totalElementos,
  );

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Historial de asistencias">
          <Table.Header>
            <Table.Column isRowHeader>Fecha</Table.Column>
            <Table.Column>Hora</Table.Column>
            <Table.Column>Alumno</Table.Column>
            <Table.Column>Modalidad / turno</Table.Column>
            <Table.Column>Registrado por</Table.Column>
          </Table.Header>

          <Table.Body
            items={asistencias}
            renderEmptyState={() => (
              <p className="py-6 text-center text-sm text-hierro-400">
                No hay asistencias que coincidan con los filtros.
              </p>
            )}
          >
            {(asistencia) => {
              return (
                <Table.Row id={asistencia.id}>
                  <Table.Cell>
                    <span className="whitespace-nowrap">
                      {formatearFecha(asistencia.fecha)}
                    </span>
                  </Table.Cell>

                  <Table.Cell>
                    <span className="whitespace-nowrap">
                      {asistencia.hora ? formatearHora(asistencia.hora) : "—"}
                    </span>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="min-w-36">
                      <p className="text-sm text-hueso">
                        {asistencia.alumnoNombre} {asistencia.alumnoApellido}
                      </p>

                      <p className="mt-1 text-xs text-hierro-400">
                        DNI: {asistencia.alumnoDni || "—"}
                      </p>
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    {asistencia.turnoId == null ? (
                      <span className="text-sm text-hierro-200">
                        Entrenamiento libre
                      </span>
                    ) : (
                      <div className="min-w-36">
                        <p className="text-sm text-hueso">
                          {asistencia.nombreClase || "Turno"}
                        </p>

                        <p className="mt-1 text-xs text-hierro-400">
                          Turno #{asistencia.turnoId}
                        </p>
                      </div>
                    )}
                  </Table.Cell>

                  <Table.Cell>
                    <div className="min-w-36">
                      <p className="text-sm text-hueso">
                        {asistencia.registradoPorNombre}{" "}
                        {asistencia.registradoPorApellido}
                      </p>

                      <p className="mt-1 text-xs text-hierro-400">
                        {etiquetasRol[asistencia.registradoPorRol] ??
                          asistencia.registradoPorRol}
                      </p>
                    </div>
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
              Mostrando {indiceInicial}-{indiceFinal} de {totalElementos}{" "}
              asistencias
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
                      // El -1 es porque las páginas empiezan a numerarse desde cero.
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

export default TablaAsistencias;
