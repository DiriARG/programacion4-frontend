import { useState } from "react";
import {
  Button,
  Chip,
  Dropdown,
  Label,
  Pagination,
  Table,
} from "@heroui/react";
import {
  IconBan,
  IconDotsVertical,
  IconDownload,
  IconReceipt,
} from "@tabler/icons-react";
import { formatearMoneda } from "../../utils/formatearMoneda";

const pagosPorPagina = 10;

export function TablaPagos({
  pagos = [],
  onAnularPago,
  onDescargarComprobante,
  rolUsuario,
}) {
  const [paginaActual, setPaginaActual] = useState(1);

  const cantidadPaginas = Math.ceil(pagos.length / pagosPorPagina);

  const indiceInicial = (paginaActual - 1) * pagosPorPagina;
  const indiceFinal = indiceInicial + pagosPorPagina;

  const pagosVisibles = pagos.slice(indiceInicial, indiceFinal);

  const primerPago = pagos.length === 0 ? 0 : indiceInicial + 1;
  const ultimoPago = Math.min(indiceFinal, pagos.length);

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Listado de pagos">
          <Table.Header>
            <Table.Column isRowHeader>Fecha</Table.Column>
            <Table.Column>Alumno</Table.Column>
            <Table.Column>Plan</Table.Column>
            <Table.Column>Período</Table.Column>
            <Table.Column>Monto</Table.Column>
            <Table.Column>Método</Table.Column>
            <Table.Column>Estado</Table.Column>
            <Table.Column>Acciones</Table.Column>
          </Table.Header>

          <Table.Body
            items={pagosVisibles}
            renderEmptyState={() => (
              <div className="py-12 text-center">
                <IconReceipt className="mx-auto text-hierro-500" size={48} />
                <p className="mt-2 text-sm text-hierro-400">
                  No se encontraron pagos registrados.
                </p>
              </div>
            )}
          >
            {(pago) => (
              <Table.Row id={pago.id}>
                <Table.Cell>
                  <span className="whitespace-nowrap font-medium text-hueso">
                    {pago.fechaPago}
                  </span>
                </Table.Cell>

                <Table.Cell>
                  <div className="font-medium text-hueso">
                    {pago.nombreAlumno} {pago.apellidoAlumno}
                  </div>
                  <div className="text-xs text-hierro-400">
                    DNI: {pago.dniAlumno}
                  </div>
                </Table.Cell>

                <Table.Cell>{pago.nombrePlan}</Table.Cell>

                <Table.Cell>
                  <span className="font-mono">
                    {String(pago.mesPeriodo).padStart(2, "0")}/{pago.anioPeriodo}
                  </span>
                </Table.Cell>

                <Table.Cell>
                  <span className="font-semibold text-hueso whitespace-nowrap">
                    {formatearMoneda(pago.montoAbonado)}
                  </span>
                </Table.Cell>

                <Table.Cell>
                  <span className="uppercase text-xs">{pago.metodoPago}</span>
                </Table.Cell>

                <Table.Cell>
                  <Chip
                    variant="soft"
                    color={pago.estado === "ANULADO" ? "danger" : "success"}
                  >
                    {pago.estado}
                  </Chip>
                </Table.Cell>

                <Table.Cell>
                  <div className="flex items-center gap-1">
                    {pago.comprobanteKeyMinio && (
                      <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        aria-label="Descargar comprobante"
                        onPress={() => onDescargarComprobante(pago.id)}
                      >
                        <IconDownload size={18} />
                      </Button>
                    )}

                    {pago.estado !== "ANULADO" && rolUsuario === "ADMIN_GENERAL" && (
                      <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        className="text-rojo-400 hover:text-rojo-300"
                        aria-label="Anular pago"
                        onPress={() => onAnularPago(pago)}
                      >
                        <IconBan size={18} />
                      </Button>
                    )}
                  </div>
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
              Mostrando {primerPago}-{ultimoPago} de {pagos.length} pagos
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

export default TablaPagos;