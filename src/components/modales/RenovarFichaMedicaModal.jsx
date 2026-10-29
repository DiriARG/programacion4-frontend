import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Label, Modal, Spinner } from "@heroui/react";
import { IconRefresh } from "@tabler/icons-react";
import { toast } from "sonner";

import { CampoFormulario } from "../comunes/CampoFormulario";
import { renovarFichaMedicaSchema } from "../../schemas/renovarFichaMedicaSchema";
import { fichasMedicasService } from "../../services/fichasMedicasService";

const valoresIniciales = {
  certificado: undefined,
  fechaVencimiento: "",
  observaciones: "",
};

export function RenovarFichaMedicaModal({ isOpen, onOpenChange, ficha }) {
  const queryClient = useQueryClient();

  const certificadoInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(renovarFichaMedicaSchema),
    defaultValues: valoresIniciales,
    mode: "onBlur",
  });

  const certificadoRegistro = register("certificado");
  const certificadoSeleccionado = watch("certificado");

  const nombreCertificado =
    typeof File !== "undefined" && certificadoSeleccionado instanceof File
      ? certificadoSeleccionado.name
      : (certificadoSeleccionado?.[0]?.name ?? "Ningún archivo seleccionado");

  useEffect(() => {
    if (isOpen && ficha) {
      reset({
        ...valoresIniciales,
        fechaVencimiento: ficha.fechaVencimiento ?? "",
        observaciones: ficha.observaciones ?? "",
      });

      if (certificadoInputRef.current) {
        certificadoInputRef.current.value = "";
      }
    }
  }, [isOpen, ficha, reset]);

  const mutation = useMutation({
    mutationFn: (data) =>
      fichasMedicasService.renovarFichaMedica(ficha.alumnoId, data),

    onSuccess: (fichaActualizada) => {
      queryClient.invalidateQueries({ queryKey: ["fichasMedicas"] });

      toast.success("Ficha médica renovada", {
        description: `Se renovó correctamente la ficha médica de ${fichaActualizada.alumnoNombre} ${fichaActualizada.alumnoApellido}.`,
      });

      reset(valoresIniciales);

      if (certificadoInputRef.current) {
        certificadoInputRef.current.value = "";
      }

      onOpenChange(false);
    },

    onError: (error) => {
      const respuesta = error?.response?.data;

      if (respuesta?.erroresValidacion) {
        Object.entries(respuesta.erroresValidacion).forEach(
          ([campo, mensaje]) => {
            setError(campo, {
              type: "server",
              message: mensaje,
            });
          },
        );

        return;
      }

      toast.error("No se pudo renovar la ficha médica", {
        description:
          respuesta?.mensaje ??
          "Ocurrió un problema al renovar la ficha médica.",
      });
    },
  });

  const onSubmit = (data) => {
    clearErrors();
    mutation.mutate(data);
  };

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant="blur"
        isDismissable={!mutation.isPending}
        isKeyboardDismissDisabled={mutation.isPending}
      >
        <Modal.Container size="lg" placement="center" className="max-h-[90vh]">
          <Modal.Dialog
            aria-labelledby="renovar-ficha-medica-titulo"
            aria-describedby="renovar-ficha-medica-descripcion"
            className="border border-hierro-700 bg-hierro-900"
          >
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header className="border-b border-hierro-800">
                <Modal.Icon className="text-azul-500">
                  <IconRefresh size={22} />
                </Modal.Icon>

                <div>
                  <Modal.Heading
                    id="renovar-ficha-medica-titulo"
                    className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                  >
                    Renovar ficha médica
                  </Modal.Heading>

                  <p
                    id="renovar-ficha-medica-descripcion"
                    className="mt-1 text-sm text-hierro-400"
                  >
                    Reemplazá el certificado y actualizá los datos de la ficha
                    existente.
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="max-h-[60vh] overflow-y-auto py-6">
                <div className="space-y-5">
                  <div>
                    <p className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                      Alumno
                    </p>

                    <p className="mt-2 text-sm text-hueso">
                      {ficha?.alumnoNombre} {ficha?.alumnoApellido}
                    </p>

                    {ficha?.alumnoDni ? (
                      <p className="mt-1 text-xs text-hierro-400">
                        DNI: {ficha.alumnoDni}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label
                      id="certificado-renovacion-label"
                      className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase"
                    >
                      Nuevo certificado de aptitud física
                      <span className="text-danger" aria-hidden="true">
                        {" "}
                        *
                      </span>
                    </Label>

                    <input
                      id="certificado-renovacion"
                      type="file"
                      className="hidden"
                      accept="application/pdf,image/jpeg,image/png"
                      name={certificadoRegistro.name}
                      onBlur={certificadoRegistro.onBlur}
                      onChange={certificadoRegistro.onChange}
                      disabled={mutation.isPending}
                      aria-labelledby="certificado-renovacion-label"
                      aria-invalid={Boolean(errors.certificado)}
                      ref={(elemento) => {
                        certificadoRegistro.ref(elemento);
                        certificadoInputRef.current = elemento;
                      }}
                    />

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        isDisabled={mutation.isPending}
                        onPress={() => certificadoInputRef.current?.click()}
                      >
                        Seleccionar archivo
                      </Button>

                      <span
                        className="break-all text-sm text-hierro-400"
                        aria-live="polite"
                      >
                        {nombreCertificado}
                      </span>
                    </div>

                    <p className="text-xs text-hierro-400">
                      Formatos admitidos: PDF, JPG y PNG. Tamaño máximo: 5 MB.
                    </p>

                    {errors.certificado ? (
                      <p className="text-xs text-danger" role="alert">
                        {errors.certificado.message}
                      </p>
                    ) : null}
                  </div>

                  <Controller
                    name="fechaVencimiento"
                    control={control}
                    render={({ field }) => (
                      <CampoFormulario
                        label="Nueva fecha de vencimiento"
                        type="date"
                        registration={field}
                        error={errors.fechaVencimiento?.message}
                        isRequired
                        isDisabled={mutation.isPending}
                      />
                    )}
                  />
                  <Controller
                    name="observaciones"
                    control={control}
                    render={({ field }) => (
                      <CampoFormulario
                        label="Observaciones (opcional)"
                        multiline
                        registration={field}
                        error={errors.observaciones?.message}
                        isDisabled={mutation.isPending}
                        placeholder="Agregá observaciones relevantes..."
                        rows={4}
                      />
                    )}
                  />
                </div>
              </Modal.Body>

              <Modal.Footer className="border-t border-hierro-800 pt-5">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  isDisabled={mutation.isPending}
                  onPress={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isDisabled={mutation.isPending || !ficha}
                >
                  {mutation.isPending ? (
                    <>
                      <Spinner size="sm" />
                      Renovando...
                    </>
                  ) : (
                    "Renovar ficha"
                  )}
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

export default RenovarFichaMedicaModal;
