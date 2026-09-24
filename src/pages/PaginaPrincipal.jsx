import { Navbar } from "../components/publico/Navbar";
import { Hero } from "../components/publico/Hero";
import { PorqueElegirnos } from "../components/publico/PorqueElegirnos";
import { Nosotros } from "../components/publico/Nosotros";
import { Planes } from "../components/publico/Planes";
import { Contacto } from "../components/publico/Contacto";
import { Footer } from "../components/publico/Footer";

export function PaginaPrincipal() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <PorqueElegirnos />
        <Nosotros />
        <Planes />
        <Contacto />
      </main>

      <Footer />
    </>
  );
}
export default PaginaPrincipal;
