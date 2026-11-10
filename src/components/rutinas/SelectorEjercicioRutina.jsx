import { useState } from "react";
import {
  Autocomplete,
  Button,
  Label,
  ListBox,
  SearchField,
  useFilter,
} from "@heroui/react";
import { IconPlus } from "@tabler/icons-react";

export function SelectorEjercicioRutina({
  ejercicios = [],
  onAgregar,
  isDisabled = false,
  isPending = false,
  isError = false,
  onRetry,
}) {
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);

  const { contains } = useFilter({ sensitivity: "base" });

  const sinEjercicios = ejercicios.length === 0;

  const agregarEjercicio = () => {
    if (!ejercicioSeleccionado) {
      return;
    }

    // Le comunica al componente padre (CrearRutinaModal) el ejercicio seleccionado para incorporarlo al formulario.
    onAgregar(ejercicioSeleccionado);
    // Se limpia la selección del Autocomplete.
    setEjercicioSeleccionado(null);
  };

  return (
    <div className="space-y-3">
      <Autocomplete
        className="w-full"
        variant="secondary"
        placeholder={
          isPending
            ? "Cargando ejercicios..."
            : isError
              ? "No se pudieron cargar los ejercicios"
              : sinEjercicios
                ? "No hay ejercicios activos"
                : "Buscá por nombre o grupo muscular"
        }
        value={ejercicioSeleccionado}
        onChange={(valor) =>
          setEjercicioSeleccionado(valor ? String(valor) : null)
        }
        isDisabled={isDisabled || isPending || isError || sinEjercicios}
      >
        <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
          Seleccionar ejercicio
        </Label>

        <Autocomplete.Trigger>
          <Autocomplete.Value>
            {({ isPlaceholder, selectedText, defaultChildren }) =>
              isPlaceholder ? defaultChildren : selectedText
            }
          </Autocomplete.Value>

          <Autocomplete.ClearButton />
          <Autocomplete.Indicator />
        </Autocomplete.Trigger>

        <Autocomplete.Popover>
          <Autocomplete.Filter filter={contains}>
            <SearchField aria-label="Buscar ejercicios">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input
                  placeholder="Buscar ejercicio..."
                  aria-label="Buscar ejercicio"
                />
              </SearchField.Group>
            </SearchField>

            <ListBox>
              {ejercicios.map((ejercicio) => {
                const textoEjercicio = `${ejercicio.nombre} · ${ejercicio.grupoMuscular}`;

                return (
                  <ListBox.Item
                    key={ejercicio.id}
                    id={String(ejercicio.id)}
                    textValue={textoEjercicio}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-hueso">
                        {ejercicio.nombre}
                      </span>

                      <span className="text-xs text-hierro-400">
                        {ejercicio.grupoMuscular}
                      </span>
                    </div>

                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                );
              })}
            </ListBox>
          </Autocomplete.Filter>
        </Autocomplete.Popover>
      </Autocomplete>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onPress={agregarEjercicio}
          isDisabled={isDisabled || !ejercicioSeleccionado}
        >
          <IconPlus size={16} />
          Agregar ejercicio
        </Button>
      </div>

      {isPending ? (
        <p className="text-xs text-hierro-400">
          Cargando ejercicios activos...
        </p>
      ) : isError ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-hierro-400">
            No se pudo consultar el catálogo de ejercicios.
          </p>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onPress={onRetry}
            isDisabled={isDisabled}
          >
            Reintentar
          </Button>
        </div>
      ) : sinEjercicios ? (
        <p className="text-xs text-hierro-400">
          No hay ejercicios activos disponibles en el catálogo.
        </p>
      ) : (
        <p className="text-xs text-hierro-400">
          Podés agregar el mismo ejercicio más de una vez si necesitás
          incorporarlo en distintos días.
        </p>
      )}
    </div>
  );
}

export default SelectorEjercicioRutina;
