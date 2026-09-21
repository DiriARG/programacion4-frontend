import {
  IconBarbell,
  IconFlame,
  IconTarget,
  IconUsersGroup,
} from "@tabler/icons-react";

const beneficios = [
  {
    icono: IconBarbell,
    titulo: "Equipamiento",
    texto: "Pesas libres, barras y máquinas pensadas para entrenar de verdad.",
  },
  {
    icono: IconUsersGroup,
    titulo: "Comunidad",
    texto:
      "Un lugar donde el esfuerzo ajeno empuja el propio y nadie entrena solo.",
  },
  {
    icono: IconTarget,
    titulo: "Seguimiento",
    texto: "Entrenamiento orientado a objetivos, con progreso registrado.",
  },
  {
    icono: IconFlame,
    titulo: "Constancia",
    texto: "Rutinas sostenibles y presencia del profesor en cada etapa.",
  },
];

export function PorqueElegirnos() {
  return (
    <section
      id="por-que"
      className="border-t border-hierro-400/20 bg-hierro-950 py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="etiqueta">Por qué Iron Empire</p>

          <h2 className="titulo-xl mt-3 text-3xl text-hueso sm:text-4xl lg:text-5xl">
            Lo que nos diferencia
          </h2>

          <div
            className="mx-auto mt-5 h-px w-16 bg-azul-600"
            aria-hidden="true"
          />
        </div>

        {/* Se recorre el array beneficios para generar una tarjeta <article> por cada beneficio.
         La grilla adapta automáticamente la cantidad de columnas según el ancho de pantalla (grid-cols). 
         */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {beneficios.map(({ icono: Icon, titulo, texto }) => (
            <article
              key={titulo}
              className="border border-hierro-800 bg-hierro-900/40 p-6 transition-colors hover:border-azul-700"
            >
              <span className="grid size-12 place-items-center border border-hierro-400/30 text-azul-500">
                <Icon size={22} stroke={1.5} />
              </span>

              <h3 className="mt-5 font-titulos text-base tracking-[0.18em] text-hueso uppercase">
                {titulo}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-hierro-400">
                {texto}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PorqueElegirnos;
