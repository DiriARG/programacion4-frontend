import Logotipo from "../comunes/Logotipo";

import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconBrandYoutube,
} from "@tabler/icons-react";

const redesSociales = [
  {
    id: "instagram",
    etiqueta: "Instagram",
    href: "https://www.instagram.com/",
    icono: IconBrandInstagram,
  },
  {
    id: "whatsapp",
    etiqueta: "WhatsApp",
    href: "https://web.whatsapp.com/",
    icono: IconBrandWhatsapp,
  },
  {
    id: "youtube",
    etiqueta: "YouTube",
    href: "https://www.youtube.com/",
    icono: IconBrandYoutube,
  },
  {
    id: "facebook",
    etiqueta: "Facebook",
    href: "https://www.facebook.com/",
    icono: IconBrandFacebook,
  },
];

const enlaces = [
  { etiqueta: "Inicio", href: "#inicio" },
  { etiqueta: "Por qué elegirnos", href: "#por-que" },
  { etiqueta: "Nosotros", href: "#nosotros" },
  { etiqueta: "Planes", href: "#planes" },
  { etiqueta: "Contacto", href: "#contacto" },
];

const datosContacto = [
  "Dirección pendiente de definición",
  "+54 000 000-0000",
  "contacto@ironempire.placeholder",
];

export function Footer() {
  return (
    <footer className="border-t border-hierro-800 bg-hierro-900/60">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logotipo />

          <p className="mt-4 font-titulos text-sm tracking-[0.3em] text-hierro-400 uppercase">
            Be the best you
          </p>
        </div>

        <div>
          <h3 className="font-titulos text-sm tracking-[0.24em] text-hueso uppercase">
            Enlaces
          </h3>

          <ul className="mt-4 space-y-3 text-sm text-hierro-400">
            {enlaces.map(({ etiqueta, href }) => (
              <li key={href}>
                <a href={href} className="transition-colors hover:text-hueso">
                  {etiqueta}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-titulos text-sm tracking-[0.24em] text-hueso uppercase">
            Mi cuenta
          </h3>

          <ul className="mt-4 space-y-3 text-sm text-hierro-400">
            <li>
              <a href="/login" className="transition-colors hover:text-hueso">
                Ingresar
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-titulos text-sm tracking-[0.24em] text-hueso uppercase">
            Contacto y redes
          </h3>

          <ul className="mt-4 space-y-3 text-sm text-hierro-400">
            {datosContacto.map((dato) => (
              <li key={dato}>{dato}</li>
            ))}
          </ul>

          <ul className="mt-5 flex items-center gap-3">
            {redesSociales.map(({ id, etiqueta, href, icono: Icono }) => (
              <li key={id}>
                <a
                  href={href}
                  aria-label={etiqueta}
                  className="grid size-10 place-items-center rounded-md border border-hierro-700 text-hierro-200 transition-colors hover:border-azul-600 hover:text-hueso"
                >
                  <Icono size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
