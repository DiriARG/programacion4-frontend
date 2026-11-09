import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Label, ListBox, Select, Spinner } from "@heroui/react";
import {
  IconArrowLeft,
  IconFilter,
  IconCalendarPlus,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import { Link } from "react-router";
import { toast } from "sonner";

import { CampoFormulario } from "../components/comunes/CampoFormulario";
import { TablaPagos } from "../components/pagos/TablaPagos";
import { useAutenticacion } from "../context/AutenticacionContext";
import { pagosService } from "../services/pagosService";
import { RegistrarPagoModal } from "../components/modales/RegistrarPagoModal";
import { AnularPagoModal } from "../components/modales/AnularPagoModal";

const pagosPorPagina = 10;

const filtrosIniciales = {
  fechaDesde: "",
  fechaHasta: "",
  alumno: "",
  estado: "TODOS",
};

export function PaginaPagos() {
  const { rol } = useAutenticacion();

  const [filtrosFormulario, setFiltrosFormulario] = useState(filtrosIniciales);
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosIniciales);
  const [paginaActual, setPaginaActual] = useState(0);

  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [pagoAAnular, setPagoAAnular] = useState(null);

  const esAdminGeneral = rol === "ADMIN_GENERAL";

  // Consulta limpia idéntica a PaginaPlanes (la ruta ya está protegida en App.jsx)
  const {
    data: historialPaginado,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["pagos", filtrosAplicados, paginaActual, pagosPorPagina],
    queryFn: () =>
      pagosService.consultarHistorial({
        ...filtrosAplicados,
        page: paginaActual,
        size: pagosPorPagina,
      }),
  });

  const actualizarFiltro = (campo, valor) => {
    setFiltrosFormulario((actuales) => ({
      ...actuales,
      [campo]: valor,
    }));
  };

  const aplicarFiltros = (evento) => {
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

  const descargarComprobante = async (idPago) => {
    try {
      const blob = await pagosService.descargarComprobante(idPago);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `comprobante-pago-${idPago}.pdf`;
      a.click();
    } catch {
      toast.error("No se pudo descargar el comprobante.");
    }
  };

  const handleAnularIntento = (pago) => {
    if (!esAdminGeneral) {
      toast.error("Acción no autorizada", {
        description: "Solo el Administrador General puede anular pagos.",
      });
      return;
    }
    setPagoAAnular(pago);
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
              <h1 className="heading-xl mt-3 text-hueso">Gestión de pagos</h1>
              <p className="mt-3 max-w-2xl text-sm text-hierro-400">
                Registrá cobros de cuotas/planes, consultá el historial financiero y administrá anulaciones.
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
                onChange={(e) => actualizarFiltro("fechaDesde", e.target.value)}
              />

              <CampoFormulario
                label="Fecha hasta"
                type="date"
                value={filtrosFormulario.fechaHasta}
                onChange={(e) => actualizarFiltro("fechaHasta", e.target.value)}
              />

              <CampoFormulario
                label="Buscar por alumno"
                placeholder="Nombre, apellido o DNI"
                value={filtrosFormulario.alumno}
                onChange={(e) => actualizarFiltro("alumno", e.target.value)}
                autoComplete="off"
              />

              <Select
                className="w-full"
                variant="secondary"
                value={filtrosFormulario.estado}
                onChange={(valor) => actualizarFiltro("estado", valor ?? "TODOS")}
              >
                <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                  Estado
                </Label>
                <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="TODOS" textValue="Todos">Todos</ListBox.Item>
                    <ListBox.Item id="REALIZADO" textValue="Realizado">Realizado</ListBox.Item>
                    <ListBox.Item id="ANULADO" textValue="Anulado">Anulado</ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" size="md" onPress={limpiarFiltros}>
                <IconRefresh size={16} /> Limpiar filtros
              </Button>
              <Button type="submit" variant="primary" size="md">
                <IconSearch size={16} /> Buscar
              </Button>
            </div>
          </form>

          <section className="mt-8 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-titulos text-lg tracking-[0.08em] text-hueso uppercase">
                  Registros
                </h2>
                <p className="mt-1 text-sm text-hierro-400">
                  Ordenados desde la transacción más reciente.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="md"
                onPress={() => setModalRegistroAbierto(true)}
              >
                <IconCalendarPlus size={16} /> Registrar nuevo pago
              </Button>
            </div>

            {isPending ? (
              <div className="flex min-h-60 items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : isError ? (
              <div className="surface-plate p-6 text-center">
                <p className="text-sm text-hierro-200">No se pudo cargar el historial de pagos.</p>
                <Button className="mt-4" variant="secondary" size="md" onPress={() => refetch()}>
                  Reintentar
                </Button>
              </div>
            ) : (
              <TablaPagos
                pagos={historialPaginado?.content ?? []}
                paginaActual={paginaActual}
                totalPaginas={historialPaginado?.totalPages ?? 0}
                totalElementos={historialPaginado?.totalElements ?? 0}
                registrosPorPagina={pagosPorPagina}
                onCambiarPagina={setPaginaActual}
                onAnularPago={handleAnularIntento}
                onDescargarComprobante={descargarComprobante}
                rolUsuario={rol}
              />
            )}
          </section>

          <RegistrarPagoModal
            isOpen={modalRegistroAbierto}
            onOpenChange={setModalRegistroAbierto}
          />

          {esAdminGeneral && (
            <AnularPagoModal
              pago={pagoAAnular}
              isOpen={Boolean(pagoAAnular)}
              onOpenChange={(abierto) => !abierto && setPagoAAnular(null)}
            />
          )}
        </div>
      </section>
    </main>
  );
}

export default PaginaPagos;