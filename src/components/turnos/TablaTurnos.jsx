import { useEffect, useState } from "react";
import {
  Button,
  Chip,
  Dropdown,
  Label,
  Pagination,
  Table,
} from "@heroui/react";
import { IconDotsVertical, IconEye } from "@tabler/icons-react";
import {
  formatearDiaSemana,
  formatearHora,
} from "../../utils/formatearDiaYHora";

const turnosPorPagina = 10;

export function TablaTurnos({ turnos = [], onVerDetalle }) {
  const [paginaActual, setPaginaActual] = useState(1);

  const cantidadPaginas = Math.ceil(turnos.length / turnosPorPagina);

  useEffect(() => {
    setPaginaActual((pagina) => Math.min(pagina, Math.max(cantidadPaginas, 1)));
  }, [cantidadPaginas]);

  const indiceInicial = (paginaActual - 1) * turnosPorPagina;
  const indiceFinal = indiceInicial + turnosPorPagina;

  const turnosVisibles = turnos.slice(indiceInicial, indiceFinal);

  const primerTurno = turnos.length === 0 ? 0 : indiceInicial + 1;
  const ultimoTurno = Math.min(indiceFinal, turnos.length);

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Listado de turnos">
          <Table.Header>
            <Table.Column isRowHeader>Clase</Table.Column>
            <Table.Column>Profesor</Table.Column>
            <Table.Column>Día</Table.Column>
            <Table.Column>Horario</Table.Column>
            <Table.Column>Estado</Table.Column>
            <Table.Column>Acciones</Table.Column>
          </Table.Header>

          <Table.Body
            items={turnosVisibles}
            renderEmptyState={() => (
              <p className="py-6 text-center text-sm text-hierro-400">
                No hay turnos para mostrar.
              </p>
            )}
          >
            {(turno) => (
              <Table.Row id={turno.id}>
                <Table.Cell>{turno.nombreClase}</Table.Cell>

                <Table.Cell>
                  {turno.profesorNombre} {turno.profesorApellido}
                </Table.Cell>

                <Table.Cell>
                  {formatearDiaSemana(turno.diaSemana)}
                </Table.Cell>

                <Table.Cell>
                  <span className="whitespace-nowrap">
                    {formatearHora(turno.horaInicio)} -{" "}
                    {formatearHora(turno.horaFin)}
                  </span>
                </Table.Cell>

                <Table.Cell>
                  <Chip
                    variant="soft"
                    color={turno.activo ? "success" : "danger"}
                  >
                    {turno.activo ? "Activo" : "Inactivo"}
                  </Chip>
                </Table.Cell>
                <Table.Cell>
                  <Dropdown>
                    <Button
                      isIconOnly
                      variant="ghost"
                      size="sm"
                      aria-label={`Acciones del turno ${turno.nombreClase}`}
                    >
                      <IconDotsVertical size={18} />
                    </Button>

                    <Dropdown.Popover>
                      <Dropdown.Menu
                        onAction={(accion) => {
                          if (accion === "ver-detalle") {
                            onVerDetalle(turno);
                          }
                        }}
                      >
                        <Dropdown.Item id="ver-detalle" textValue="Ver detalle">
                          <IconEye size={16} />
                          <Label>Ver detalle</Label>
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown.Popover>
                  </Dropdown>
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
              Mostrando {primerTurno}-{ultimoTurno} de {turnos.length} turnos
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

export default TablaTurnos;
