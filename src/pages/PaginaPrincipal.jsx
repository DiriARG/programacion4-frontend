import { Hero } from "../components/public/Hero";
import { PorqueElegirnos } from "../components/public/PorqueElegirnos";
import { Nosotros } from "../components/public/Nosotros";
import { Planes } from "../components/public/Planes";

export function PaginaPrincipal() {
  return (
    <main>
      <Hero />
      <PorqueElegirnos />
      <Nosotros />
      <Planes />
    </main>
  );
}
export default PaginaPrincipal;
