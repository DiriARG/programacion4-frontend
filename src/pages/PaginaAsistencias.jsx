import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Label, ListBox, Select, Spinner } from "@heroui/react";
import {
  IconArrowLeft,
  IconFilter,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import { Link } from "react-router";
import { toast } from "sonner";

import { CampoFormulario } from "../components/comunes/CampoFormulario";
import { TablaAsistencias } from "../components/asistencias/TablaAsistencias";
import { useAutenticacion } from "../context/AutenticacionContext";
import { asistenciasService } from "../services/asistenciasService";
import { turnosService } from "../services/turnosService";
import { formatearDiaSemana, formatearHora } from "../utils/formatearDiaYHora";

// Cantidad de asistencias que se solicitan por página (aunque por defecto en el back también usa 10).
const asistenciasPorPagina = 10;

const filtrosIniciales = {
  fechaDesde: "",
  fechaHasta: "",
  alumno: "",
  modalidad: "TODAS",
  turnoId: "",
};

export function PaginaAsistencias() {
  const { rol } = useAutenticacion();

  // Guarda los valores que el usuario está modificando en el formulario.
  const [filtrosFormulario, setFiltrosFormulario] = useState(filtrosIniciales);
  // Guarda los filtros que se aplicarán al consultar el historial.
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosIniciales);
  const [paginaActual, setPaginaActual] = useState(0);

  const rolPermitido = ["ADMIN_GESTION", "ADMIN_GENERAL", "PROFESOR"].includes(
    rol,
  );

  const {
    data: turnosDisponibles = [],
    isPending: turnosPendientes,
    isError: turnosError,
  } = useQuery({
    queryKey: rol === "PROFESOR" ? ["turnos", "profesor"] : ["turnos"],
    queryFn:
      rol === "PROFESOR"
        ? turnosService.consultarTurnosProfesor
        : turnosService.consultarTurnos,
    // Solo se necesita consultar los turnos cuando se selecciona esa modalidad.
    enabled: rolPermitido && filtrosFormulario.modalidad === "CON_TURNO",
  });

  const {
    data: historialPaginado,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "asistencias",
      rol,
      filtrosAplicados,
      paginaActual,
      asistenciasPorPagina,
    ],
    queryFn: () => {
      const parametros = {
        ...filtrosAplicados,
        page: paginaActual,
        size: asistenciasPorPagina,
      };

      if (rol === "PROFESOR") {
        return asistenciasService.consultarHistorialProfesor(parametros);
      }

      return asistenciasService.consultarHistorialAdministrativo(parametros);
    },
    enabled: rolPermitido,
  });

  // Actualiza el filtro indicado y conserva los valores de los demás campos.
  const actualizarFiltro = (campo, valor) => {
    setFiltrosFormulario((actuales) => ({
      ...actuales,
      [campo]: valor,
    }));
  };

  const aplicarFiltros = (evento) => {
    // Evitar que la página se recargue.
    evento.preventDefault();

    if (
      filtrosFormulario.fechaDesde &&
      filtrosFormulario.fechaHasta &&
      filtrosFormulario.fechaDesde > filtrosFormulario.fechaHasta
    ) {
      toast.error("Rango de fechas inválido", {
        description: "La fecha desde no puede ser posterior a la fecha hasta.",
      });

      return;
    }

    setFiltrosAplicados({
      // Copia los filtros actuales del formulario.
      ...filtrosFormulario,
      alumno: filtrosFormulario.alumno.trim(),
      // Envía el turno solo cuando se filtra por una modalidad con turno.
      turnoId:
        filtrosFormulario.modalidad === "CON_TURNO"
          ? filtrosFormulario.turnoId
          : "",
    });

    setPaginaActual(0);
  };

  const limpiarFiltros = () => {
    setFiltrosFormulario({ ...filtrosIniciales });
    setFiltrosAplicados({ ...filtrosIniciales });
    setPaginaActual(0);
  };

  return (
    <main className="min-h-screen bg-hierro-950 pt-10 pb-16">
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="relative">
            <Link
              to="/"
              aria-label="Volver al inicio"
              className="mb-6 inline-flex items-center gap-2 font-titulos text-xs tracking-[0.2em] text-hierro-400 uppercase transition-colors hover:text-hueso lg:absolute lg:-left-[250px] lg:top-6 lg:mb-0"
            >
              <IconArrowLeft size={16} />
              Inicio
            </Link>

            <div>
              <p className="etiqueta text-azul-500">
                {rol === "PROFESOR"
                  ? "Actividad del profesor"
                  : "Gestión del gimnasio"}
              </p>

              <h1 className="heading-xl mt-3 text-hueso">
                Historial de asistencias
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-hierro-400">
                Consultá las asistencias registradas y encontrá los registros
                mediante los filtros disponibles.
              </p>
            </div>
          </div>

          <form
            noValidate
            onSubmit={aplicarFiltros}
            className="surface-plate mt-8 space-y-5 p-5 sm:p-6"
          >
            <div className="flex items-center gap-2 border-b border-hierro-700 pb-4">
              <IconFilter size={20} className="text-azul-500" />

              <h2 className="font-titulos text-base tracking-[0.08em] text-hueso uppercase">
                Filtros de búsqueda
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <CampoFormulario
                label="Fecha desde"
                type="date"
                value={filtrosFormulario.fechaDesde}
                onChange={(evento) =>
                  actualizarFiltro("fechaDesde", evento.target.value)
                }
              />

              <CampoFormulario
                label="Fecha hasta"
                type="date"
                value={filtrosFormulario.fechaHasta}
                onChange={(evento) =>
                  actualizarFiltro("fechaHasta", evento.target.value)
                }
              />

              <CampoFormulario
                label="Buscar por alumno"
                placeholder="Nombre, apellido o DNI"
                value={filtrosFormulario.alumno}
                onChange={(evento) =>
                  actualizarFiltro("alumno", evento.target.value)
                }
                autoComplete="off"
              />

              <Select
                className="w-full"
                variant="secondary"
                placeholder="Seleccioná una modalidad"
                value={filtrosFormulario.modalidad}
                onChange={(valor) => {
                  const modalidad = valor ?? "TODAS";

                  setFiltrosFormulario((actuales) => ({
                    ...actuales,
                    modalidad,
                    turnoId: modalidad === "CON_TURNO" ? actuales.turnoId : "",
                  }));
                }}
              >
                <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                  Modalidad
                </Label>

                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>

                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="TODAS" textValue="Todas">
                      Todas
                    </ListBox.Item>

                    <ListBox.Item id="CON_TURNO" textValue="Con turno">
                      Con turno
                    </ListBox.Item>

                    <ListBox.Item id="LIBRE" textValue="Entrenamiento libre">
                      Entrenamiento libre
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>

              {filtrosFormulario.modalidad === "CON_TURNO" ? (
                <Select
                  className="w-full"
                  variant="secondary"
                  placeholder={
                    turnosPendientes
                      ? "Cargando turnos..."
                      : turnosError
                        ? "No se pudieron cargar los turnos"
                        : "Todos los turnos"
                  }
                  value={filtrosFormulario.turnoId || null}
                  onChange={(valor) => actualizarFiltro("turnoId", valor ?? "")}
                  isDisabled={
                    turnosPendientes ||
                    turnosError ||
                    turnosDisponibles.length === 0
                  }
                >
                  <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                    Turno específico (opcional)
                  </Label>

                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>

                  <Select.Popover>
                    <ListBox>
                      {turnosDisponibles.map((turno) => {
                        const nombreTurno = [
                          turno.nombreClase,
                          formatearDiaSemana(turno.diaSemana),
                          `${formatearHora(turno.horaInicio)} - ${formatearHora(turno.horaFin)}`,
                          turno.activo === false ? "(Inactivo)" : "",
                        ]
                          .filter(Boolean)
                          .join(" · ");

                        return (
                          <ListBox.Item
                            key={turno.id}
                            id={String(turno.id)}
                            textValue={nombreTurno}
                          >
                            {nombreTurno}
                          </ListBox.Item>
                        );
                      })}
                    </ListBox>
                  </Select.Popover>
                </Select>
              ) : null}
            </div>

            {filtrosFormulario.modalidad === "CON_TURNO" ? (
              <div className="text-xs text-hierro-400">
                {turnosPendientes ? (
                  <p>Cargando turnos disponibles...</p>
                ) : turnosError ? (
                  <p>No se pudieron consultar los turnos disponibles.</p>
                ) : turnosDisponibles.length === 0 ? (
                  <p>No hay turnos disponibles para seleccionar.</p>
                ) : (
                  <p>
                    Si no seleccionás un turno específico, se mostrarán las
                    asistencias de todos los turnos que podes consultar.
                  </p>
                )}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onPress={limpiarFiltros}
              >
                <IconRefresh size={16} />
                Limpiar filtros
              </Button>

              <Button type="submit" variant="primary" size="md">
                <IconSearch size={16} />
                Buscar
              </Button>
            </div>
          </form>

          <section className="mt-8 space-y-4">
            <div>
              <h2 className="font-titulos text-lg tracking-[0.08em] text-hueso uppercase">
                Registros
              </h2>

              <p className="mt-1 text-sm text-hierro-400">
                Ordenados desde la asistencia más reciente.
              </p>
            </div>

            {isPending ? (
              <div className="flex min-h-60 items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : isError ? (
              <div className="surface-plate p-6 text-center">
                <p className="text-sm text-hierro-200">
                  No se pudo cargar el historial de asistencias.
                </p>

                <p className="mt-2 text-sm text-hierro-400">
                  Ocurrió un problema al consultar los registros.
                </p>

                <Button
                  className="mt-4"
                  variant="secondary"
                  size="md"
                  onPress={() => refetch()}
                >
                  Reintentar
                </Button>
              </div>
            ) : (
              <TablaAsistencias
                asistencias={historialPaginado?.content ?? []}
                paginaActual={paginaActual}
                totalPaginas={historialPaginado?.totalPages ?? 0}
                totalElementos={historialPaginado?.totalElements ?? 0}
                registrosPorPagina={asistenciasPorPagina}
                onCambiarPagina={setPaginaActual}
              />
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default PaginaAsistencias;
