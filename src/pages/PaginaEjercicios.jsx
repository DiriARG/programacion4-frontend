import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Label, ListBox, Select, Spinner } from "@heroui/react";
import {
  IconArrowLeft,
  IconFilter,
  IconRefresh,
  IconSearch,
  IconPlus,
} from "@tabler/icons-react";
import { Link } from "react-router";

import { CampoFormulario } from "../components/comunes/CampoFormulario";
import { TablaEjercicios } from "../components/ejercicios/TablaEjercicios";
import { useAutenticacion } from "../context/AutenticacionContext";
import { ejerciciosService } from "../services/ejerciciosService";
import { CrearEjercicioModal } from "../components/ejercicios/CrearEjercicioModal";

const ejerciciosPorPagina = 10;

const filtrosIniciales = {
  busqueda: "",
  estado: "TODOS",
};

export function PaginaEjercicios() {
  const { rol } = useAutenticacion();

  const [filtrosFormulario, setFiltrosFormulario] = useState(filtrosIniciales);
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosIniciales);
  const [paginaActual, setPaginaActual] = useState(0);
  const [modalCrearEjercicioAbierto, setModalCrearEjercicioAbierto] =
    useState(false);
  const rolPermitido = rol === "ADMIN_GENERAL";

  const {
    data: ejerciciosPaginados,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "ejercicios",
      filtrosAplicados,
      paginaActual,
      ejerciciosPorPagina,
    ],
    queryFn: () => {
      const parametros = {
        busqueda: filtrosAplicados.busqueda,
        activo:
          filtrosAplicados.estado === "TODOS"
            ? ""
            : filtrosAplicados.estado === "ACTIVO",
        page: paginaActual,
        size: ejerciciosPorPagina,
      };

      return ejerciciosService.consultarEjercicios(parametros);
    },
    enabled: rolPermitido,
  });

  const actualizarFiltro = (campo, valor) => {
    setFiltrosFormulario((actuales) => ({
      ...actuales,
      [campo]: valor,
    }));
  };

  const aplicarFiltros = (evento) => {
    evento.preventDefault();

    setFiltrosAplicados({
      ...filtrosFormulario,
      busqueda: filtrosFormulario.busqueda.trim(),
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
              <p className="etiqueta text-azul-500">Gestión del gimnasio</p>

              <h1 className="heading-xl mt-3 text-hueso">
                Catálogo de ejercicios
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-hierro-400">
                Consultá los ejercicios disponibles, sus grupos musculares y su
                estado de actividad.
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

            <div className="grid gap-5 sm:grid-cols-2">
              <CampoFormulario
                label="Buscar ejercicio"
                placeholder="Nombre o grupo muscular"
                value={filtrosFormulario.busqueda}
                onChange={(evento) =>
                  actualizarFiltro("busqueda", evento.target.value)
                }
                autoComplete="off"
              />

              <Select
                className="w-full"
                variant="secondary"
                placeholder="Seleccioná un estado"
                value={filtrosFormulario.estado}
                onChange={(valor) =>
                  actualizarFiltro("estado", valor ?? "TODOS")
                }
              >
                <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                  Estado del ejercicio
                </Label>

                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>

                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="TODOS" textValue="Todos">
                      Todos
                    </ListBox.Item>

                    <ListBox.Item id="ACTIVO" textValue="Activos">
                      Activos
                    </ListBox.Item>

                    <ListBox.Item id="INACTIVO" textValue="Inactivos">
                      Inactivos
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-titulos text-lg tracking-[0.08em] text-hueso uppercase">
                  Listado de ejercicios
                </h2>

                <p className="mt-1 text-sm text-hierro-400">
                  Ejercicios registrados en el sistema.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="md"
                onPress={() => setModalCrearEjercicioAbierto(true)}
              >
                <IconPlus size={16} />
                Crear ejercicio
              </Button>
            </div>

            {isPending ? (
              <div className="flex min-h-60 items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : isError ? (
              <div className="surface-plate p-6 text-center">
                <p className="text-sm text-hierro-200">
                  No se pudieron cargar los ejercicios.
                </p>

                <p className="mt-2 text-sm text-hierro-400">
                  Ocurrió un problema al consultar el catálogo.
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
              <TablaEjercicios
                ejercicios={ejerciciosPaginados?.content ?? []}
                paginaActual={paginaActual}
                totalPaginas={ejerciciosPaginados?.totalPages ?? 0}
                totalElementos={ejerciciosPaginados?.totalElements ?? 0}
                registrosPorPagina={ejerciciosPorPagina}
                onCambiarPagina={setPaginaActual}
              />
            )}
          </section>
          <CrearEjercicioModal
            isOpen={modalCrearEjercicioAbierto}
            onOpenChange={setModalCrearEjercicioAbierto}
          />
        </div>
      </section>
    </main>
  );
}

export default PaginaEjercicios;
