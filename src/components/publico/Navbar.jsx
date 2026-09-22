import { useEffect, useState } from "react";
import { Link } from "react-router";
import { buttonVariants } from "@heroui/react";

import Logotipo from "../comunes/Logotipo";

const navLinks = [
  { etiqueta: "Inicio", href: "#inicio" },
  { etiqueta: "Nosotros", href: "#nosotros" },
  { etiqueta: "Planes", href: "#planes" },
  { etiqueta: "Contacto", href: "#contacto" },
];

export function Navbar() {
  /* Guarda si el usuario ya hizo scroll hacia abajo. Arranca en "false" porque inicialmente la página está en la parte superior.
  estaDesplazado --> Valor actual.
  establecerDesplazado --> función que cambia el valor de estaDesplazado. */
  const [estaDesplazado, establecerDesplazado] = useState(false);

  useEffect(() => {
    /* Esta función comprueba la posición actual del scroll y actualiza el estado. 
    Se ejecuta al iniciar el efecto (alDesplazarse()) y cada vez que ocurre un evento "scroll". */
    const alDesplazarse = () => {
      /* "window.scrollY" indica cuántos píxeles se desplazó verticalmente el usuario.
      Si pasó los 24px, estaDesplazado será true. */
      establecerDesplazado(window.scrollY > 24);
    };

    // Se comprueba inmediatamente la posición actual del scroll para establecer el estado inicial según dónde esté la pagina.
    alDesplazarse();

    /* Se registra la función para que se ejecute cada vez que el usuario se desplaza y así mantener actualizado el estado del Navbar.
    "passive: true" indica que esta función no va a impedir ni cancelar el scroll. */
    window.addEventListener("scroll", alDesplazarse, { passive: true });

    // Se elimina el "listener" cuando el componente se desmonta.
    return () => {
      window.removeEventListener("scroll", alDesplazarse);
    };
  }, []);

  return (
    <header
      /* El aspecto del Navbar cambia dependiendo de estaDesplazado:
      Si es true aparece un fondo oscuro, un borde inferior y se aplica desenfoque al fondo.
      Si es false el fondo es transparente y no se muestra el borde. */
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        estaDesplazado
          ? "border-hierro-800/80 bg-hierro-950/92 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex w-full max-w-6xl items-center justify-between gap-8 px-5 py-4 sm:px-8"
      >
        <Logotipo />

        <div className="flex items-center gap-8">
          <ul className="flex items-center gap-7">
            {navLinks.map(({ etiqueta, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="font-titulos text-sm tracking-[0.16em] text-hierro-200 uppercase transition-colors hover:text-hueso"
                >
                  {etiqueta}
                </a>
              </li>
            ))}
          </ul>

          <Link
            to="/login"
            className={buttonVariants({
              variant: "primary",
              size: "md",
            })}
          >
            Ingresar
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
