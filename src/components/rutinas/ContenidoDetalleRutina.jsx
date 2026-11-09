import { useEffect, useState } from "react";
import { Card, Chip, Tabs } from "@heroui/react";
import {
  IconCalendarEvent,
  IconClipboardList,
  IconUser,
} from "@tabler/icons-react";

import { formatearFecha } from "../../utils/formatearDiaYHora";
import { TarjetaEjercicioDetalle } from "./TarjetaEjercicioDetalle";

const DIAS_SEMANA = [
  { id: "LUNES", corto: "Lun", nombre: "Lunes" },
  { id: "MARTES", corto: "Mar", nombre: "Martes" },
  { id: "MIERCOLES", corto: "Mié", nombre: "Miércoles" },
  { id: "JUEVES", corto: "Jue", nombre: "Jueves" },
  { id: "VIERNES", corto: "Vie", nombre: "Viernes" },
  { id: "SABADO", corto: "Sáb", nombre: "Sábado" },
  { id: "DOMINGO", corto: "Dom", nombre: "Domingo" },
];


/* Componente compartido que concentra la estructura visual para consultar una rutina y sus ejercicios asociados.
 Se reutiliza tanto en DetalleRutinaModal, para las consultas del profesor, como en PaginaRutinaAlumno, para las consultas del alumno.
 Recibe la rutina completa mediante la prop "rutina" y se encarga exclusivamente de su presentación. */
export function ContenidoDetalleRutina({ rutina }) {
  const [diaSeleccionado, setDiaSeleccionado] = useState("LUNES");

  const ejerciciosRutina = rutina?.ejercicios ?? [];

  // Selecciona el primer día que tenga ejercicios al abrir la rutina.
  useEffect(() => {
    /* Busca el primer día de la semana que tenga al menos un ejercicio asignado.
    find devuelve el primer día que cumple la condición y el some comprueba si existe al menos un ejercicio asígnado a ese dia. */
    const primerDiaConEjercicios = DIAS_SEMANA.find((dia) =>
      ejerciciosRutina.some((ejercicio) => ejercicio.diaSemana === dia.id),
    );

    // Si no hay ejercicios, comienza mostrando el lunes.
    setDiaSeleccionado(primerDiaConEjercicios?.id ?? "LUNES");
  }, [rutina?.id, ejerciciosRutina]); // Se ejecuta cuando se selecciona una rutina diferente o se actualizó la lista de ejercicios de la rutina.

  const nombreAlumno = `${rutina.alumnoNombre} ${rutina.alumnoApellido}`;

  const nombreProfesor = `${rutina.profesorNombre} ${rutina.profesorApellido}`;

  return (
    <>
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="heading-lg text-hueso">{rutina.nombre}</h2>

          <Chip variant="soft" color={rutina.activa ? "success" : "danger"}>
            {rutina.activa ? "Activa" : "Inactiva"}
          </Chip>
        </div>

        <Card
          variant="secondary"
          className="border border-hierro-700 bg-hierro-800"
        >
          <Card.Content className="grid grid-cols-1 gap-5 p-5 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <IconUser size={22} className="shrink-0 text-hierro-400" />

              <div className="min-w-0">
                <p className="text-xs text-hierro-400">Alumno</p>

                <p className="mt-1 font-medium text-hueso">{nombreAlumno}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <IconClipboardList
                size={22}
                className="shrink-0 text-hierro-400"
              />

              <div className="min-w-0">
                <p className="text-xs text-hierro-400">Creada por</p>

                <p className="mt-1 font-medium text-hueso">{nombreProfesor}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <IconCalendarEvent
                size={22}
                className="shrink-0 text-hierro-400"
              />

              <div className="min-w-0">
                <p className="text-xs text-hierro-400">Fecha de creación</p>

                <p className="mt-1 font-medium text-hueso">
                  {formatearFecha(rutina.fechaCreacion)}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </section>

      <section className="space-y-4 border-t border-hierro-700 pt-5">
        <div>
          <h2 className="font-titulos text-base tracking-[0.08em] text-hueso uppercase">
            Planificación semanal
          </h2>

          <p className="mt-1 text-sm text-hierro-400">
            Seleccioná un día para consultar sus ejercicios.
          </p>
        </div>

        <Tabs
          variant="secondary"
          selectedKey={diaSeleccionado}
          onSelectionChange={(dia) => setDiaSeleccionado(String(dia))}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Días de la rutina">
              {DIAS_SEMANA.map((dia) => (
                <Tabs.Tab id={dia.id} key={dia.id}>
                  {dia.corto}
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>

          {DIAS_SEMANA.map((dia) => {
            // Se obtienen los ejercicios del día actual y se los ordena según su posición en la rutina.
            const ejerciciosDelDia = ejerciciosRutina
              .filter((ejercicio) => ejercicio.diaSemana === dia.id)
              .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

            return (
              <Tabs.Panel id={dia.id} key={dia.id} className="pt-4">
                {diaSeleccionado === dia.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-titulos text-base text-hueso">
                        {dia.nombre}
                      </h3>

                      <span className="text-xs text-hierro-400">
                        {ejerciciosDelDia.length}{" "}
                        {ejerciciosDelDia.length === 1
                          ? "ejercicio"
                          : "ejercicios"}
                      </span>
                    </div>

                    {ejerciciosDelDia.length > 0 ? (
                      <div className="space-y-3">
                        {ejerciciosDelDia.map((ejercicio) => (
                          <TarjetaEjercicioDetalle
                            key={ejercicio.id}
                            ejercicio={ejercicio}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="surface-plate p-5 text-center text-sm text-hierro-400">
                        No hay ejercicios planificados para este día.
                      </p>
                    )}
                  </div>
                ) : null}
              </Tabs.Panel>
            );
          })}
        </Tabs>
      </section>
    </>
  );
}

export default ContenidoDetalleRutina;
