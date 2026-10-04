import { useEffect, useState } from "react";
import {
  Button,
  Chip,
  Dropdown,
  Label,
  Pagination,
  Table,
} from "@heroui/react";
import { IconDotsVertical, IconPencil } from "@tabler/icons-react";
const usuariosPorPagina = 10;

export function TablaUsuarios({ usuarios = [], onModificar }) {
  // La tabla comienza siempre en la página 1.
  const [paginaActual, setPaginaActual] = useState(1);

  /* Calcula cuántas páginas hacen falta, incluso si la última no está llena.
  Ej.: 25 / 10 = 2.5. "Math.ceil()"" redondea hacia arriba al entero mayor, por lo que se necesitan 3 páginas. */
  const cantidadPaginas = Math.ceil(usuarios.length / usuariosPorPagina);

  // Cuando cambia la cantidad de páginas, ajusta la página actual (se ejecuta el useEffect) para que siga siendo válida.
  useEffect(() => {
    setPaginaActual((pagina) => Math.min(pagina, Math.max(cantidadPaginas, 1)));
  }, [cantidadPaginas]);

  const indiceInicial = (paginaActual - 1) * usuariosPorPagina;
  const indiceFinal = indiceInicial + usuariosPorPagina;

  const usuariosVisibles = usuarios.slice(indiceInicial, indiceFinal);

  const primerUsuario = usuarios.length === 0 ? 0 : indiceInicial + 1;
  const ultimoUsuario = Math.min(indiceFinal, usuarios.length);

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Listado de usuarios">
          <Table.Header>
            <Table.Column isRowHeader>Nombre</Table.Column>
            <Table.Column>Apellido</Table.Column>
            <Table.Column>DNI</Table.Column>
            <Table.Column>Email</Table.Column>
            <Table.Column>Teléfono</Table.Column>
            <Table.Column>Estado</Table.Column>
            <Table.Column>Acciones</Table.Column>
          </Table.Header>

          <Table.Body
            items={usuariosVisibles}
            renderEmptyState={() => (
              <p className="py-6 text-center text-sm text-hierro-400">
                No hay usuarios para mostrar.
              </p>
            )}
          >
            {(usuario) => (
              <Table.Row id={usuario.id}>
                <Table.Cell>{usuario.nombre}</Table.Cell>
                <Table.Cell>{usuario.apellido}</Table.Cell>
                <Table.Cell>{usuario.dni}</Table.Cell>
                <Table.Cell>{usuario.email}</Table.Cell>
                <Table.Cell>{usuario.telefono}</Table.Cell>
                <Table.Cell>
                  <Chip
                    variant="soft"
                    color={usuario.activo ? "success" : "danger"}
                  >
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </Chip>
                </Table.Cell>
                <Table.Cell>
                  <Dropdown>
                    <Button
                      isIconOnly
                      variant="ghost"
                      size="sm"
                      aria-label={`Acciones de ${usuario.nombre} ${usuario.apellido}`}
                    >
                      <IconDotsVertical size={18} />
                    </Button>

                    <Dropdown.Popover>
                      <Dropdown.Menu
                        onAction={(accion) => {
                          if (accion === "modificar") {
                            onModificar(usuario);
                          }
                        }}
                      >
                        <Dropdown.Item id="modificar" textValue="Modificar">
                          <IconPencil size={16} />
                          <Label>Modificar</Label>
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

      {/* La paginación solo aparece cuando hay más de una página. */}
      {cantidadPaginas > 1 ? (
        <Table.Footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Pagination>
            <Pagination.Summary>
              Mostrando {primerUsuario}-{ultimoUsuario} de {usuarios.length}{" "}
              usuarios
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

              {/* Genera los números de las páginas disponibles y crea un control de paginación para cada una. */}
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

export default TablaUsuarios;
