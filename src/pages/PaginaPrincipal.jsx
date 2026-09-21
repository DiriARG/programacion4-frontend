import { Hero } from "../components/publico/Hero";
import { PorqueElegirnos } from "../components/publico/PorqueElegirnos";
import { Nosotros } from "../components/publico/Nosotros";
import { Planes } from "../components/publico/Planes";
import { Contacto } from "../components/publico/Contacto";
import { Footer } from "../components/publico/Footer";

export function PaginaPrincipal() {
  return (
    <main>
      <Hero />
      <PorqueElegirnos />
      <Nosotros />
      <Planes />
      <Contacto />
      <Footer />
    </main>
  );
}
export default PaginaPrincipal;
