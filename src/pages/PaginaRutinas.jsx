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

import { CampoFormulario } from "../components/comunes/CampoFormulario";
import { TablaRutinas } from "../components/rutinas/TablaRutinas";
import { useAutenticacion } from "../context/AutenticacionContext";
import { rutinasService } from "../services/rutinasService";

const rutinasPorPagina = 10;

const filtrosIniciales = {
  busqueda: "",
  estado: "TODAS",
};

export function PaginaRutinas() {
  const { rol } = useAutenticacion();

  const [filtrosFormulario, setFiltrosFormulario] = useState(filtrosIniciales);
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosIniciales);
  const [paginaActual, setPaginaActual] = useState(0);

  const rolPermitido = rol === "PROFESOR";

  const {
    data: rutinasPaginadas,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["rutinas", filtrosAplicados, paginaActual, rutinasPorPagina],
    queryFn: () => {
      const parametros = {
        busqueda: filtrosAplicados.busqueda,
        activa:
          filtrosAplicados.estado === "TODAS"
            ? ""
            // El backend espera un Boolean (activa) por lo tanto cuando el estado seleccionado es "ACTIVA", devuelve true, pero cuando es "INACTIVA", devuelve false.
            : filtrosAplicados.estado === "ACTIVA",
        page: paginaActual,
        size: rutinasPorPagina,
      };

      return rutinasService.consultarRutinas(parametros);
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

              <h1 className="heading-xl mt-3 text-hueso">Rutinas</h1>

              <p className="mt-3 max-w-2xl text-sm text-hierro-400">
                Consultá las rutinas de tus alumnos, sus fechas de creación y su
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
                label="Buscar rutina o alumno"
                placeholder="Nombre de rutina, alumno o DNI"
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
                  actualizarFiltro("estado", valor ?? "TODAS")
                }
              >
                <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                  Estado de la rutina
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

                    <ListBox.Item id="ACTIVA" textValue="Activas">
                      Activas
                    </ListBox.Item>

                    <ListBox.Item id="INACTIVA" textValue="Inactivas">
                      Inactivas
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
            <div>
              <h2 className="font-titulos text-lg tracking-[0.08em] text-hueso uppercase">
                Listado de rutinas
              </h2>

              <p className="mt-1 text-sm text-hierro-400">
                Consultá la información general y el estado de cada rutina.
              </p>
            </div>

            {isPending ? (
              <div className="flex min-h-60 items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : isError ? (
              <div className="surface-plate p-6 text-center">
                <p className="text-sm text-hierro-200">
                  No se pudieron cargar las rutinas.
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
              <TablaRutinas
                rutinas={rutinasPaginadas?.content ?? []}
                paginaActual={paginaActual}
                totalPaginas={rutinasPaginadas?.totalPages ?? 0}
                totalElementos={rutinasPaginadas?.totalElements ?? 0}
                registrosPorPagina={rutinasPorPagina}
                onCambiarPagina={setPaginaActual}
              />
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default PaginaRutinas;
