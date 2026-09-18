import { buttonVariants } from "@heroui/react";
import { IconCheck } from "@tabler/icons-react";

/* Formateador numérico nativo de JS (Intl.NumberFormat) adaptado a la región 
de Argentina (es-AR) para mostrar precios en pesos sin decimales. */
const FORMATEADOR_MONEDA = new Intl.NumberFormat("es-AR", {
  // El número debe formatearse como una cantidad monetaria (incluyendo el símbolo de la moneda).
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

/* Componente visual que representa un único plan del gimnasio.
Recibe los datos de un plan y se encarga de mostrar sus datos. */
export function TarjetaPlan({ plan, enlaceCta = "#contacto" }) {
  const {
    nombre,
    descripcion,
    precioMensual,
    beneficios = [],
    destacado = false,
  } = plan;

  return (
    <article
      className={`flex h-full flex-col border p-7 transition-transform duration-300 hover:-translate-y-1 ${
        destacado
          ? "border-azul-600 bg-hierro-900"
          : "border-hierro-800 bg-hierro-900/40 hover:border-hierro-600"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-titulos text-2xl tracking-[0.18em] text-hueso uppercase">
          {nombre}
        </h3>

        {destacado ? (
          <span className="shrink-0 border border-azul-600 px-2 py-1 font-titulos text-[10px] tracking-[0.2em] text-azul-500 uppercase">
            Popular
          </span>
        ) : null}
      </div>

      <p className="mt-3 min-h-10 text-sm leading-relaxed text-hierro-400">
        {descripcion}
      </p>

      <p className="mt-6 flex items-baseline gap-2">
        <span className="titulo-xl text-4xl text-hueso">
          {typeof precioMensual === "number"
            ? FORMATEADOR_MONEDA.format(precioMensual)
            : "$—"}
        </span>

        <span className="text-xs tracking-[0.2em] text-hierro-400 uppercase">
          / mes
        </span>
      </p>

      {beneficios.length > 0 ? (
        <ul className="mt-7 flex-1 space-y-3">
          {beneficios.map((beneficio) => (
            <li
              key={beneficio}
              className="flex items-start gap-3 text-sm text-hierro-200/85"
            >
              <IconCheck size={16} className="mt-0.5 shrink-0 text-azul-500" />

              <span>{beneficio}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1" />
      )}

      <a
        href={enlaceCta}
        className={`${buttonVariants({
          variant: destacado ? "primary" : "outline",
          size: "md",
          fullWidth: true,
        })} mt-8`}
      >
        Quiero este plan
      </a>
    </article>
  );
}

export default TarjetaPlan;
