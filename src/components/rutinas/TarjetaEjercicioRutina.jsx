import { Controller } from "react-hook-form";
import { Button, Label, ListBox, Select } from "@heroui/react";
import { IconChevronDown, IconChevronUp, IconTrash } from "@tabler/icons-react";

import { CampoFormulario } from "../comunes/CampoFormulario";
import { nombresDias } from "../../utils/formatearDiaYHora";

export function TarjetaEjercicioRutina({
  indice,
  ejercicio,
  orden,
  register,
  control,
  errores,
  onMoverArriba,
  onMoverAbajo,
  onEliminar,
  puedeMoverArriba,
  puedeMoverAbajo,
  isDisabled = false,
}) {
  return (
    <div className="surface-plate space-y-4 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-hueso">
            {ejercicio?.nombre ?? "Ejercicio seleccionado"}
          </p>

          <p className="mt-1 text-xs text-hierro-400">
            {ejercicio?.grupoMuscular ?? ""}
            {orden ? ` · Orden ${orden} del día` : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            isIconOnly
            variant="ghost"
            size="sm"
            aria-label="Subir ejercicio"
            isDisabled={isDisabled || !puedeMoverArriba}
            onPress={onMoverArriba}
          >
            <IconChevronUp size={18} />
          </Button>

          <Button
            type="button"
            isIconOnly
            variant="ghost"
            size="sm"
            aria-label="Bajar ejercicio"
            isDisabled={isDisabled || !puedeMoverAbajo}
            onPress={onMoverAbajo}
          >
            <IconChevronDown size={18} />
          </Button>

          <Button
            type="button"
            isIconOnly
            variant="ghost"
            size="sm"
            aria-label={`Eliminar ${ejercicio?.nombre ?? "ejercicio"}`}
            isDisabled={isDisabled}
            onPress={onEliminar}
          >
            <IconTrash size={18} className="text-danger" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CampoFormulario
          label="Series"
          type="number"
          min="1"
          step="1"
          placeholder="Ej.: 3"
          registration={register(`ejercicios.${indice}.series`)}
          error={errores?.series?.message}
          isRequired
          isDisabled={isDisabled}
        />

        <CampoFormulario
          label="Repeticiones"
          type="number"
          min="1"
          step="1"
          placeholder="Ej.: 12"
          registration={register(`ejercicios.${indice}.repeticiones`)}
          error={errores?.repeticiones?.message}
          isRequired
          isDisabled={isDisabled}
        />

        <CampoFormulario
          label="Peso (kg)"
          type="number"
          min="0"
          max="999.99"
          step="0.01"
          placeholder="Opcional"
          registration={register(`ejercicios.${indice}.peso`)}
          error={errores?.peso?.message}
          isDisabled={isDisabled}
        />

        <SelectDiaSemana
          indice={indice}
          control={control}
          error={errores?.diaSemana?.message}
          isDisabled={isDisabled}
        />
      </div>
    </div>
  );
}

// Componente auxiliar para conectar el Select de HeroUI con React Hook Form.
function SelectDiaSemana({ indice, control, error, isDisabled }) {
  return (
    <Controller
      name={`ejercicios.${indice}.diaSemana`}
      control={control}
      render={({ field }) => (
        <Select
          className="w-full"
          variant="secondary"
          placeholder="Seleccioná un día"
          name={field.name}
          value={field.value || null}
          onChange={(valor) => field.onChange(valor ?? "")}
          onBlur={field.onBlur}
          isRequired
          isInvalid={Boolean(error)}
          isDisabled={isDisabled}
        >
          <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
            Día
          </Label>

          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>

          <Select.Popover>
            <ListBox>
              {Object.entries(nombresDias).map(([valor, nombre]) => (
                <ListBox.Item key={valor} id={valor} textValue={nombre}>
                  {nombre}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>

          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}
        </Select>
      )}
    />
  );
}

export default TarjetaEjercicioRutina;
