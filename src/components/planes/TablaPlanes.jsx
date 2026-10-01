import { useEffect, useState } from "react";
import { Chip, Pagination, Table } from "@heroui/react";

import { formatearMoneda } from "../../utils/formatearMoneda";

const planesPorPagina = 10;

export function TablaPlanes({ planes = [] }) {
  const [paginaActual, setPaginaActual] = useState(1);

  const cantidadPaginas = Math.ceil(planes.length / planesPorPagina);

  useEffect(() => {
    setPaginaActual((pagina) => Math.min(pagina, Math.max(cantidadPaginas, 1)));
  }, [cantidadPaginas]);

  const indiceInicial = (paginaActual - 1) * planesPorPagina;
  const indiceFinal = indiceInicial + planesPorPagina;

  const planesVisibles = planes.slice(indiceInicial, indiceFinal);

  const primerPlan = planes.length === 0 ? 0 : indiceInicial + 1;
  const ultimoPlan = Math.min(indiceFinal, planes.length);

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Listado de planes">
          <Table.Header>
            <Table.Column isRowHeader>Nombre</Table.Column>
            <Table.Column>Descripción</Table.Column>
            <Table.Column>Precio mensual</Table.Column>
            <Table.Column>Beneficios</Table.Column>
            <Table.Column>Estado</Table.Column>
          </Table.Header>

          <Table.Body
            items={planesVisibles}
            renderEmptyState={() => (
              <p className="py-6 text-center text-sm text-hierro-400">
                No hay planes para mostrar.
              </p>
            )}
          >
            {(plan) => (
              <Table.Row id={plan.id}>
                <Table.Cell>{plan.nombre}</Table.Cell>

                <Table.Cell>
                  <div className="max-w-sm">
                    {plan.descripcion || "Sin descripción"}
                  </div>
                </Table.Cell>

                <Table.Cell>
                  <span className="whitespace-nowrap">
                    {formatearMoneda(plan.precioMensual)}
                  </span>
                </Table.Cell>

                <Table.Cell>
                  {plan.beneficios?.length ? (
                    <ul className="space-y-1">
                      {plan.beneficios.map((beneficio) => (
                        <li key={beneficio}>• {beneficio}</li>
                      ))}
                    </ul>
                  ) : (
                    "Sin beneficios"
                  )}
                </Table.Cell>

                <Table.Cell>
                  <Chip
                    variant="soft"
                    color={plan.activo ? "success" : "danger"}
                  >
                    {plan.activo ? "Activo" : "Inactivo"}
                  </Chip>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>

      {cantidadPaginas > 1 ? (
        <Table.Footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Pagination>
            <Pagination.Summary>
              Mostrando {primerPlan}-{ultimoPlan} de {planes.length} planes
            </Pagination.Summary>

            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  aria-label="Página anterior"
                  isDisabled={paginaActual === 1}
                  onPress={() =>
                    setPaginaActual((pagina) => Math.max(1, pagina - 1))
                  }
                >
                  <Pagination.PreviousIcon />
                </Pagination.Previous>
              </Pagination.Item>

              {Array.from(
                { length: cantidadPaginas },
                (_, indice) => indice + 1,
              ).map((pagina) => (
                <Pagination.Item key={pagina}>
                  <Pagination.Link
                    aria-label={`Página ${pagina}`}
                    isActive={paginaActual === pagina}
                    onPress={() => setPaginaActual(pagina)}
                  >
                    {pagina}
                  </Pagination.Link>
                </Pagination.Item>
              ))}

              <Pagination.Item>
                <Pagination.Next
                  aria-label="Página siguiente"
                  isDisabled={paginaActual === cantidadPaginas}
                  onPress={() =>
                    setPaginaActual((pagina) =>
                      Math.min(cantidadPaginas, pagina + 1),
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

export default TablaPlanes;
