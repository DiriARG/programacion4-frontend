import {
  IconBrandWhatsapp,
  IconClock,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";

import FormularioContacto from "./FormularioContacto";

const whatsappUrl  = "https://web.whatsapp.com/";

const datosContacto  = [
  {
    icono: IconMapPin,
    etiqueta: "Dirección",
    valor: "Dirección pendiente de definición",
  },
  {
    icono: IconPhone,
    etiqueta: "Teléfono",
    valor: "+54 000 000-0000",
  },
  {
    icono: IconMail,
    etiqueta: "Email",
    valor: "contacto@ironempire.placeholder",
  },
  {
    icono: IconClock,
    etiqueta: "Horarios",
    valor: "Horarios pendientes de definición",
  },
  {
    icono: IconBrandWhatsapp,
    etiqueta: "WhatsApp",
    valor: "Hacé tu consulta",
    href: whatsappUrl ,
  },
];

export function Contacto() {
  return (
    <section
      id="contacto"
      className="fondo-placa scroll-mt-20 border-t border-hierro-800/70 py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="etiqueta">Contacto</p>

            <h2 className="titulo-xl mt-3 text-3xl text-hueso sm:text-4xl lg:text-5xl">
              Vení a entrenar
            </h2>

            <div className="mt-5 h-px w-16 bg-azul-600" aria-hidden="true" />

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-hierro-200/80">
              Escribinos y te contamos cómo empezar.
            </p>

            <ul className="mt-10 space-y-6">
              {datosContacto .map(({ icono: Icono, etiqueta, valor, href }) => (
                <li key={etiqueta} className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center border border-hierro-700 text-azul-500">
                    <Icono size={18} />
                  </span>

                  <div className="min-w-0">
                    <p className="font-titulos text-xs tracking-[0.22em] text-hierro-600 uppercase">
                      {etiqueta}
                    </p>

                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-sm text-hierro-200 transition-colors hover:text-hueso"
                      >
                        {valor}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-hierro-200">{valor}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <FormularioContacto />
        </div>
      </div>
    </section>
  );
}

export default Contacto;
