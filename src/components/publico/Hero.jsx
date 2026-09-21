import { buttonVariants } from "@heroui/react";
import heroImagen from "../../assets/hero-iron.jpg";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-[92svh] items-end overflow-hidden"
    >
      <img
        src={heroImagen}
        alt="Atleta entrenando con mancuernas de hierro en un gimnasio"
        width={1920}
        height={1280}
        className="absolute inset-0 -z-20 size-full object-cover object-center"
      />
      {/* Le pone una capa oscura encima de la imagen. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-hierro-950 via-hierro-950/80 to-hierro-950/40"
        aria-hidden="true"
      />
      <div className="mx-auto w-full max-w-6xl px-5 pt-32 pb-20 sm:px-8 sm:pb-28">
        <h1 className="titulo-xl text-5xl text-hueso sm:text-7xl lg:text-8xl">
          Iron Empire
        </h1>
        <p className="mt-6 font-titulos text-2xl tracking-[0.14em] text-hierro-200 uppercase sm:text-3xl">
          Be the best you
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#planes"
            className={buttonVariants({ variant: "primary", size: "lg" })}
          >
            Ver planes
          </a>
          <a
            href="#contacto"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Contactanos
          </a>
        </div>
      </div>
    </section>
  );
}
export default Hero;
