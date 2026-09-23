import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Spinner } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import CampoFormulario from "../comunes/CampoFormulario";
import { loginSchema } from "../../schemas/autenticacionSchema";
import { useAutenticacion } from "../../context/AutenticacionContext";

const valoresIniciales = {
  email: "",
  contrasenia: "",
};

export function FormularioLogin() {
  const navigate = useNavigate();
  
  const { iniciarSesion } = useAutenticacion();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: valoresIniciales,
  });

  // Define la operación de login y las acciones para éxito o error.
  const mutation = useMutation({
    mutationFn: iniciarSesion,

    onSuccess: () => {
      toast.success("Sesión iniciada", {
        description: "Bienvenido a Iron Empire.",
      });

      navigate("/");
    },

    onError: () => {
      toast.error("No pudimos iniciar sesión", {
        description: "Verificá tus credenciales e intentá de nuevo.",
      });
    },
  });

  // Envía los datos validados a la mutación.
  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form
      noValidate
       // "handleSubmit" valida los datos antes de ejecutar onSubmit.
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <CampoFormulario
        label="Email"
        type="email"
        placeholder="tu@email.com"
        autoComplete="email"
        registration={register("email")}
        error={errors.email?.message}
      />

      <CampoFormulario
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        registration={register("contrasenia")}
        error={errors.contrasenia?.message}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isDisabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Spinner size="sm" />
            Ingresando…
          </>
        ) : (
          "Iniciar sesión"
        )}
      </Button>
    </form>
  );
}

export default FormularioLogin;