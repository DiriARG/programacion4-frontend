import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form } from "@heroui/react";
import { useForm } from "react-hook-form";

import CampoFormulario from "../comunes/CampoFormulario";
import { contactoSchema } from "../../schemas/contactoSchema";

const valoresIniciales = {
  nombre: "",
  telefono: "",
  email: "",
  mensaje: "",
};

export function FormularioContacto() {
  // Configura el formulario, su validación y los estados necesarios para manejarlo.
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactoSchema),
    defaultValues: valoresIniciales,
  });

  // Todavía no se manda nada, falta la creación de la ruta del back.
  const onSubmit = async (datos) => {
    console.log("Formulario de contacto:", datos);

    await new Promise((resolve) => setTimeout(resolve, 500));

    reset();
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex h-full flex-col space-y-5 border border-hierro-800 bg-hierro-900/50 p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <CampoFormulario
          label="Nombre"
          placeholder="Tu nombre"
          autoComplete="name"
          registration={register("nombre")}
          error={errors.nombre?.message}
        />

        <CampoFormulario
          label="Teléfono"
          type="tel"
          placeholder="+54 9 11 0000-0000"
          autoComplete="tel"
          registration={register("telefono")}
          error={errors.telefono?.message}
        />
      </div>

      <CampoFormulario
        label="Email"
        type="email"
        placeholder="tu@email.com"
        autoComplete="email"
        registration={register("email")}
        error={errors.email?.message}
      />

      <CampoFormulario
        label="Mensaje"
        multiline
        rows={4}
        className="flex w-full flex-1 flex-col"
        controlClassName="min-h-28 flex-1"
        registration={register("mensaje")}
        error={errors.mensaje?.message}
        placeholder="Contanos qué estás buscando"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isDisabled={isSubmitting}
      >
        {isSubmitting ? "Enviando…" : "Enviar mensaje"}
      </Button>

      <p className="text-xs text-hierro-600">
        Formulario de demostración: todavía no se envía a ningún servidor.
      </p>
    </Form>
  );
}

export default FormularioContacto;
