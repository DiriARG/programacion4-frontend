import {
  Autocomplete,
  Button,
  Label,
  ListBox,
  SearchField,
  useFilter,
} from "@heroui/react";

export function SelectorAlumnoRutina({
  alumnos = [],
  value,
  onChange,
  onBlur,
  error,
  isPending = false,
  isError = false,
  isDisabled = false,
  onRetry,
}) {
  // Proporciona una función de búsqueda que encuentra coincidencias sin distignuir entre mayúsculas, minúsculas ni acentros (Se utiliza en el Autocomplete).
  const { contains } = useFilter({ sensitivity: "base" });

  const sinAlumnos = alumnos.length === 0;

  return (
    <div className="space-y-2">
      <Autocomplete
        className="w-full"
        variant="secondary"
        placeholder={
          isPending
            ? "Cargando alumnos..."
            : isError
              ? "No se pudieron cargar los alumnos"
              : sinAlumnos
                ? "No hay alumnos activos"
                : "Buscá por nombre, apellido o DNI"
        }
        name="alumnoId"
        value={value || null}
        onChange={(valor) => onChange(valor ? String(valor) : "")}
        onBlur={onBlur}
        isRequired
        isInvalid={Boolean(error)}
        isDisabled={isDisabled || isPending || isError || sinAlumnos}
      >
        <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
          Alumno
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
            <SearchField aria-label="Buscar alumnos">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input
                  placeholder="Buscar alumno..."
                  aria-label="Buscar alumno"
                />
              </SearchField.Group>
            </SearchField>

            <ListBox>
              {alumnos.map((alumno) => {
                const nombreCompleto = `${alumno.nombre} ${alumno.apellido}`;

                const textoAlumno = alumno.dni
                  ? `${nombreCompleto} · DNI ${alumno.dni}`
                  : nombreCompleto;

                return (
                  <ListBox.Item
                    key={alumno.id}
                    id={String(alumno.id)}
                    textValue={textoAlumno}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-hueso">
                        {nombreCompleto}
                      </span>

                      <span className="text-xs text-hierro-400">
                        DNI: {alumno.dni || "—"}
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

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      {isPending ? (
        <p className="text-xs text-hierro-400">Cargando alumnos activos...</p>
      ) : isError ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-hierro-400">
            No se pudieron consultar los alumnos activos.
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
      ) : sinAlumnos ? (
        <p className="text-xs text-hierro-400">
          No hay alumnos activos disponibles para crear una rutina.
        </p>
      ) : null}
    </div>
  );
}

export default SelectorAlumnoRutina;
