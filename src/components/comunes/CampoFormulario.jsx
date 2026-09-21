import { FieldError, Input, Label, TextArea, TextField } from "@heroui/react";

/*
  Componente reutilizable para representar un campo de formulario.
 
  Agrupa en un mismo lugar:
  - La etiqueta del campo (Label).
  - El campo de entrada (Input o TextArea).
  - El mensaje de error de validación (FieldError).
 
  La prop "registration" recibe la información que proporciona
  React Hook Form mediante "register()", para conectar este campo
  con el formulario y permitir que React Hook Form controle su valor,
  cambios y validación.

  De esta forma, los distintos formularios de la aplicación pueden
  reutilizar la misma estructura y mantener una apariencia consistente.
 */
export function CampoFormulario({
  label,
  error,
  type = "text",
  multiline = false,
  registration,
  className,
  // Clases CSS aplicadas directamente al Input o al TextArea.
  controlClassName,
  ...props
}) {
  return (
    <TextField isInvalid={Boolean(error)} className={className ?? "w-full"}>
      <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
        {label}
      </Label>

      {/*
        Si "multiline" es true, se muestra un TextArea, caso contrario un Input normal.
        Esto se utiliza, por ejemplo, para el campo "Mensaje".
       */}
      {multiline ? (
        <TextArea
          rows={3}
          className={`resize-none ${controlClassName ?? ""}`.trim()}
          style={{ resize: "none" }}
          {...registration}
          {...props}
        />
      ) : (
        <Input
          type={type}
          className={controlClassName}
          {...registration}
          {...props}
        />
      )}

      {/* Si existe un error, mostramos el mensaje debajo del campo.
        Si no existe, no se renderiza nada.
       */}
      {error ? <FieldError>{error}</FieldError> : null}
    </TextField>
  );
}

export default CampoFormulario;
