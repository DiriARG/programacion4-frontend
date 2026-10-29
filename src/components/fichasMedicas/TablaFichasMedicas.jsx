import { useState } from "react";
import {
  Button,
  Chip,
  Dropdown,
  Label,
  Pagination,
  Table,
} from "@heroui/react";
import { IconDotsVertical, IconEye, IconRefresh } from "@tabler/icons-react";
import { formatearFecha } from "../../utils/formatearDiaYHora";

// Muestra las observaciones de una ficha y permite expandirlas de manera independiente a las observaciones de las demás filas.
function ContenidoObservaciones({ observaciones }) {
  const [expandida, setExpandida] = useState(false);

  const observacion = observaciones?.trim() ?? "";

  if (!observacion) {
    return <span className="text-sm text-hierro-400">Sin observaciones</span>;
  }

  return (
    // Se limita el ancho para que las observaciones no ensanchen la tabla.
    <div className="max-w-xs">
      {/* Mostramos dos líneas inicialmente y el texto completo al expandir. */}
      <p
        className={`break-words text-sm text-hierro-200 ${
          // Contrae el texto a dos líneas, salvo que el usuario lo expanda.
          expandida ? "" : "line-clamp-2"
        }`}
      >
        {observacion}
      </p>

      {/* Solo mostramos el botón cuando el texto podría necesitar expansión. */}
      {observacion.length > 70 ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-1"
          // Informa si el contenido de esta fila está expandido.
          aria-expanded={expandida}
          // Cambia el estado únicamente para esta ficha.
          onPress={() => setExpandida((actual) => !actual)}
        >
          {expandida ? "Ver menos" : "Ver completa"}
        </Button>
      ) : null}
    </div>
  );
}

export function TablaFichasMedicas({
  fichasMedicas = [],
  paginaActual = 0,
  totalPaginas = 0,
  totalElementos = 0,
  registrosPorPagina = 10,
  onCambiarPagina,
  onVerCertificado,
  onRenovarFicha,
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
        <Table.Content aria-label="Listado de fichas médicas">
          <Table.Header>
            <Table.Column isRowHeader>Alumno</Table.Column>
            <Table.Column>Registro / actualización</Table.Column>
            <Table.Column>Vencimiento</Table.Column>
            <Table.Column>Observaciones</Table.Column>
            <Table.Column>Acciones</Table.Column>
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
                          ficha.estado === "VIGENTE" ? "success" : "danger"
                        }
                      >
                        {ficha.estado === "VIGENTE" ? "Vigente" : "Vencida"}
                      </Chip>
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <ContenidoObservaciones
                      observaciones={ficha.observaciones}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Dropdown>
                      <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        aria-label={`Acciones de la ficha médica de ${ficha.alumnoNombre} ${ficha.alumnoApellido}`}
                      >
                        <IconDotsVertical size={18} />
                      </Button>

                      <Dropdown.Popover>
                        <Dropdown.Menu
                          onAction={(accion) => {
                            if (accion === "ver-certificado") {
                              onVerCertificado?.(ficha);
                            }
                            if (accion === "renovar-ficha") {
                              onRenovarFicha?.(ficha);
                            }
                          }}
                        >
                          <Dropdown.Item
                            id="ver-certificado"
                            textValue="Ver certificado"
                          >
                            <IconEye size={16} />
                            <Label>Ver certificado</Label>
                          </Dropdown.Item>
                          <Dropdown.Item
                            id="renovar-ficha"
                            textValue="Renovar ficha"
                          >
                            <IconRefresh size={16} />
                            <Label>Renovar ficha</Label>
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown.Popover>
                    </Dropdown>
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
