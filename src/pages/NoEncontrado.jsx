import { Link } from "react-router";

export function PaginaNoEncontrada() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hierro-950 px-5">
      <div className="max-w-md text-center">
        <p className="etiqueta">Error 404</p>

        <h1 className="titulo-xl mt-4 text-7xl text-hueso sm:text-8xl">404</h1>

        <h2 className="mt-4 font-titulos text-xl tracking-[0.2em] text-hierro-200 uppercase">
          Esta página no existe
        </h2>

        <p className="mt-3 text-sm text-hierro-400">
          El ejercicio que buscás no está en esta rutina.
          <br />
          Volvé al inicio y seguimos entrenando.
        </p>

        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center border border-azul-600 bg-azul-600 px-6 py-3 font-titulos text-sm tracking-[0.2em] text-hueso uppercase transition-colors hover:bg-azul-700"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
