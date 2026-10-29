import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Label, ListBox, Select, Spinner } from "@heroui/react";
import {
  IconArrowLeft,
  IconFilter,
  IconRefresh,
  IconSearch,
  IconFilePlus,
} from "@tabler/icons-react";
import { Link } from "react-router";
import { toast } from "sonner";

import { CampoFormulario } from "../components/comunes/CampoFormulario";
import { TablaFichasMedicas } from "../components/fichasMedicas/TablaFichasMedicas";
import { useAutenticacion } from "../context/AutenticacionContext";
import { fichasMedicasService } from "../services/fichasMedicasService";
import { RegistrarFichaMedicaModal } from "../components/modales/RegistrarFichaMedicaModal";
import { VerCertificadoModal } from "../components/modales/VerCertificadoModal";
import { RenovarFichaMedicaModal } from "../components/modales/RenovarFichaMedicaModal";

const fichasMedicasPorPagina = 10;

const filtrosIniciales = {
  fechaVencimientoDesde: "",
  fechaVencimientoHasta: "",
  alumno: "",
  estado: "TODOS",
};

export function PaginaFichasMedicas() {
  const { rol } = useAutenticacion();

  const [filtrosFormulario, setFiltrosFormulario] = useState(filtrosIniciales);
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosIniciales);
  const [paginaActual, setPaginaActual] = useState(0);
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [fichaARenovar, setFichaARenovar] = useState(null);
  // El modal se abre cuando hay una ficha seleccionada.
  const modalCertificadoAbierto = Boolean(fichaSeleccionada);
  const modalRenovacionAbierto = Boolean(fichaARenovar);
  const rolPermitido = ["ADMIN_GESTION", "ADMIN_GENERAL"].includes(rol);

  const {
    data: historialPaginado,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "fichasMedicas",
      filtrosAplicados,
      paginaActual,
      fichasMedicasPorPagina,
    ],
    queryFn: () => {
      const parametros = {
        ...filtrosAplicados,
        /* Si se selecciona "TODOS", se envía una cadena vacía para que el servicio (fichasMedicasService) omita el parámetro "estado" y el back devuelva fichas de ambos estados. 
        Caso contrario, se envia el estado seleccionado para filtrar los resultados. */
        estado:
          filtrosAplicados.estado === "TODOS" ? "" : filtrosAplicados.estado,
        page: paginaActual,
        size: fichasMedicasPorPagina,
      };

      return fichasMedicasService.consultarHistorial(parametros);
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

    const { fechaVencimientoDesde, fechaVencimientoHasta } = filtrosFormulario;

    if (
      fechaVencimientoDesde &&
      fechaVencimientoHasta &&
      fechaVencimientoDesde > fechaVencimientoHasta
    ) {
      toast.error("Rango de fechas inválido", {
        description:
          "La fecha de vencimiento desde no puede ser posterior a la fecha hasta.",
      });

      return;
    }

    setFiltrosAplicados({
      ...filtrosFormulario,
      alumno: filtrosFormulario.alumno.trim(),
    });

    setPaginaActual(0);
  };

  const limpiarFiltros = () => {
    setFiltrosFormulario({ ...filtrosIniciales });
    setFiltrosAplicados({ ...filtrosIniciales });
    setPaginaActual(0);
  };

  // Guarda la ficha elegida para visualizar su certificado.
  const verCertificado = (ficha) => {
    setFichaSeleccionada(ficha);
  };

  // Al cerrar el modal, se limpia la ficha seleccionada.
  const cambiarModalCertificado = (abierto) => {
    if (!abierto) {
      setFichaSeleccionada(null);
    }
  };

  const renovarFicha = (ficha) => {
    setFichaARenovar(ficha);
  };

  const cambiarModalRenovacion = (abierto) => {
    if (!abierto) {
      setFichaARenovar(null);
    }
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

              <h1 className="heading-xl mt-3 text-hueso">Fichas médicas</h1>

              <p className="mt-3 max-w-2xl text-sm text-hierro-400">
                Consultá las fichas médicas de los alumnos, sus fechas de
                vencimiento y el estado de cada certificado.
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
                label="Vencimiento desde"
                type="date"
                value={filtrosFormulario.fechaVencimientoDesde}
                onChange={(evento) =>
                  actualizarFiltro("fechaVencimientoDesde", evento.target.value)
                }
              />

              <CampoFormulario
                label="Vencimiento hasta"
                type="date"
                value={filtrosFormulario.fechaVencimientoHasta}
                onChange={(evento) =>
                  actualizarFiltro("fechaVencimientoHasta", evento.target.value)
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
                placeholder="Seleccioná un estado"
                value={filtrosFormulario.estado}
                onChange={(valor) =>
                  actualizarFiltro("estado", valor ?? "TODOS")
                }
              >
                <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                  Estado de la ficha
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

                    <ListBox.Item id="VIGENTE" textValue="Vigente">
                      Vigente
                    </ListBox.Item>

                    <ListBox.Item id="VENCIDA" textValue="Vencida">
                      Vencida
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
                  Listado de fichas
                </h2>

                <p className="mt-1 text-sm text-hierro-400">
                  Consultá los certificados y sus fechas de vencimiento.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="md"
                onPress={() => setModalRegistroAbierto(true)}
              >
                <IconFilePlus size={16} />
                Registrar ficha médica
              </Button>
            </div>

            {isPending ? (
              <div className="flex min-h-60 items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : isError ? (
              <div className="surface-plate p-6 text-center">
                <p className="text-sm text-hierro-200">
                  No se pudieron cargar las fichas médicas.
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
              <TablaFichasMedicas
                fichasMedicas={historialPaginado?.content ?? []}
                paginaActual={paginaActual}
                totalPaginas={historialPaginado?.totalPages ?? 0}
                totalElementos={historialPaginado?.totalElements ?? 0}
                registrosPorPagina={fichasMedicasPorPagina}
                onCambiarPagina={setPaginaActual}
                onVerCertificado={verCertificado}
                onRenovarFicha={renovarFicha}
              />
            )}
          </section>
          <RegistrarFichaMedicaModal
            isOpen={modalRegistroAbierto}
            onOpenChange={setModalRegistroAbierto}
          />
          <VerCertificadoModal
            isOpen={modalCertificadoAbierto}
            onOpenChange={cambiarModalCertificado}
            ficha={fichaSeleccionada}
          />
          <RenovarFichaMedicaModal
            isOpen={modalRenovacionAbierto}
            onOpenChange={cambiarModalRenovacion}
            ficha={fichaARenovar}
          />
        </div>
      </section>
    </main>
  );
}

export default PaginaFichasMedicas;
