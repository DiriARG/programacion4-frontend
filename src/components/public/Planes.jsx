import { TarjetaPlan } from "./TarjetaPlan";
import { PLANES_MOCK } from "../../data/planes.mock";

export function Planes({ planes = PLANES_MOCK }) {
  return (
    <section
      id="planes"
      className="border-t border-hierro-800/70 bg-hierro-950 py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="etiqueta">Planes</p>

          <h2 className="titulo-xl mt-3 text-3xl text-hueso sm:text-4xl lg:text-5xl">
            Elegí cómo vas a entrenar
          </h2>

          <div
            className="mx-auto mt-5 h-px w-16 bg-azul-600"
            aria-hidden="true"
          />

          <p className="mt-5 text-base leading-relaxed text-hierro-200/80">
            Precios y beneficios de referencia. Los planes definitivos se
            administran desde el sistema del gimnasio.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {planes.map((plan) => (
            <TarjetaPlan key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Planes;