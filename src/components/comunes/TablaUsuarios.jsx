import { Chip, Table } from "@heroui/react";

export function TablaUsuarios({ usuarios = [] }) {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Listado de usuarios">
          <Table.Header>
            <Table.Column>Nombre</Table.Column>
            <Table.Column>Apellido</Table.Column>
            <Table.Column>DNI</Table.Column>
            <Table.Column>Email</Table.Column>
            <Table.Column>Teléfono</Table.Column>
            <Table.Column>Estado</Table.Column>
          </Table.Header>

          <Table.Body
            items={usuarios}
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
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

export default TablaUsuarios;
