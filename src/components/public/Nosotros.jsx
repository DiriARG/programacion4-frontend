import imagenDeBarra from "../../assets/barra-gim-bn.jpg";

export function Nosotros() {
  return (
    <section
      id="nosotros"
      className="border-t border-hierro-400/20 bg-hierro-950 py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-stretch lg:gap-16">
          <div className="space-y-6">
            <div className="max-w-2xl">
              <p className="etiqueta">Nuestra identidad</p>

              <h2 className="titulo-xl mt-3 text-3xl text-hueso sm:text-4xl lg:text-5xl">
                Sobre nosotros
              </h2>

              <div className="mt-5 h-px w-16 bg-azul-600" aria-hidden="true" />
            </div>

            <div className="space-y-5 text-base leading-relaxed text-hierro-400">
              <p>
                Iron Empire nace de una idea simple: volver a poner el trabajo
                en el centro. Pesas libres, técnica, disciplina y constancia.
                Sin atajos, sin promesas vacías.
              </p>

              <p>
                Pero entrenar no es solo cambiar el físico. Es ganar confianza,
                superar límites y aprender a ser constante. Por eso, construimos
                un espacio donde cada persona pueda trabajar por sus objetivos,
                progresar a su ritmo y ver el resultado de su esfuerzo.
              </p>
            </div>
          </div>

          <div className="relative min-h-64 overflow-hidden border border-hierro-400/20">
            <img
              src={imagenDeBarra}
              alt="Barras olímpicas cargadas con discos sobre el piso del gimnasio"
              loading="lazy"
              className="size-full object-cover grayscale"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Nosotros;
