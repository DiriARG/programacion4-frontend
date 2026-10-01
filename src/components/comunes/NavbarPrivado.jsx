import MenuUsuario from "../autenticacion/MenuUsuario";
import Logotipo from "./Logotipo";

export function NavbarPrivado() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-hierro-800/80 bg-hierro-950/95 backdrop-blur-md">
      <nav
        aria-label="Navegación privada"
        className="mx-auto flex w-full max-w-6xl items-center justify-between gap-8 px-5 py-4 sm:px-8"
      >
        <Logotipo />

        <MenuUsuario />
      </nav>
    </header>
  );
}

export default NavbarPrivado;