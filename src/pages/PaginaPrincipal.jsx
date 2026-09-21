import { Hero } from "../components/publico/Hero";
import { PorqueElegirnos } from "../components/publico/PorqueElegirnos";
import { Nosotros } from "../components/publico/Nosotros";
import { Planes } from "../components/publico/Planes";
import { Contacto } from "../components/publico/Contacto";

export function PaginaPrincipal() {
  return (
    <main>
      <Hero />
      <PorqueElegirnos />
      <Nosotros />
      <Planes />
      <Contacto />
    </main>
  );
}
export default PaginaPrincipal;
