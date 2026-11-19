import {
  Button,
  Chip,
  Pagination,
  Table,
} from "@heroui/react";
import {
  IconBan,
  IconDownload,
  IconReceipt,
} from "@tabler/icons-react";
import { formatearMoneda } from "../../utils/formatearMoneda";

// "2026-11-17" -> "17/11/2026" (sin pasar por Date, para evitar corrimientos de zona horaria).
function formatearFecha(fechaIso) {
  if (!fechaIso) return "-";
  const [anio, mes, dia] = fechaIso.split("-");
  return `${dia}/${mes}/${anio}`;
}

/*
 * La paginación la hace el servidor: "pagos" ya trae solo la página actual.
 * paginaActual empieza en 0 (así lo espera Spring Data).
 */
export function TablaPagos({
  pagos = [],
  paginaActual = 0,
  totalPaginas = 0,
  totalElementos = 0,
  registrosPorPagina = 10,
  onCambiarPagina,
  onAnularPago,
  onDescargarComprobante,
  rolUsuario,
}) {
  const primerPago = totalElementos === 0 ? 0 : paginaActual * registrosPorPagina + 1;
  const ultimoPago = Math.min((paginaActual + 1) * registrosPorPagina, totalElementos);

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
            items={pagos}
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
                    {formatearFecha(pago.fechaPago)}
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

                <Table.Cell>{pago.planNombre}</Table.Cell>

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
                  <Chip variant="soft" color={pago.anulado ? "danger" : "success"}>
                    {pago.anulado ? "ANULADO" : "REALIZADO"}
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

                    {!pago.anulado && rolUsuario === "ADMIN_GENERAL" && (
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

      {totalPaginas > 1 ? (
        <Table.Footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Pagination>
            <Pagination.Summary>
              Mostrando {primerPago}-{ultimoPago} de {totalElementos} pagos
            </Pagination.Summary>

            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  aria-label="Página anterior"
                  isDisabled={paginaActual === 0}
                  onPress={() => onCambiarPagina(paginaActual - 1)}
                >
                  <Pagination.PreviousIcon />
                </Pagination.Previous>
              </Pagination.Item>

              {Array.from({ length: totalPaginas }, (_, indice) => indice).map(
                (indice) => (
                  <Pagination.Item key={indice}>
                    <Pagination.Link
                      aria-label={`Página ${indice + 1}`}
                      isActive={paginaActual === indice}
                      onPress={() => onCambiarPagina(indice)}
                    >
                      {indice + 1}
                    </Pagination.Link>
                  </Pagination.Item>
                ),
              )}

              <Pagination.Item>
                <Pagination.Next
                  aria-label="Página siguiente"
                  isDisabled={paginaActual >= totalPaginas - 1}
                  onPress={() => onCambiarPagina(paginaActual + 1)}
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