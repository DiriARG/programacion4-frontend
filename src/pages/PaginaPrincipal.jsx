import { Hero } from "../components/public/Hero";
import { PorqueElegirnos } from "../components/public/PorqueElegirnos";
import { Nosotros } from "../components/public/Nosotros";

export function PaginaPrincipal() {
  return (
    <main>
      <Hero />
      <PorqueElegirnos />
      <Nosotros />
    </main>
  );
}
export default PaginaPrincipal;
