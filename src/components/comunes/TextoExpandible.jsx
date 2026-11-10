import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";

// Permite mostrar textos extensos de forma resumida y expandirlos individualmente en cada fila de la tabla.
export function TextoExpandible({
  // Valores predeterminados para las propiedades opcionales.
  texto,
  mensajeVacio = "Sin contenido",
  className = "max-w-xs",
}) {
  const [expandida, setExpandida] = useState(false);
  const [necesitaExpandir, setNecesitaExpandir] = useState(false);

  // Acá se obtiene la referencia directa al elemento <p> para consultar sus dimensiones.
  const textoRef = useRef(null);

  const contenido = texto?.trim() ?? "";

  // Se utiliza en lugar de useEffect para medir el texto antes de mostrar el resultado en pantalla y evitar que el botón aparezca con retraso.
  useLayoutEffect(() => {
    const elemento = textoRef.current;

    // Si el elemento no existe o ya está expandido no se realiza la medición.
    if (!elemento || expandida) {
      return;
    }

    // Comprueba si el contenido supera la altura visible de dos líneas.
    const comprobarDesbordamiento = () => {
      /* scrollHeight es la altura que necesita el contenido para mostrarse sin reestriciones.
      clientHeight es la altura visible actual del elemento. */
      setNecesitaExpandir(elemento.scrollHeight > elemento.clientHeight);
    };

    comprobarDesbordamiento();

    /* "ResizeObserver" vuelve a comprobar el desbordamiento cuando cambia el tamaño del texto.
    Es útil cuando cambia el tamaño de la ventana o cambia el tamaño del espacio de la tabla. */
    const observador = new ResizeObserver(comprobarDesbordamiento);
    observador.observe(elemento);

    return () => {
      observador.disconnect();
    };
  }, [contenido, expandida, className]);

  if (!contenido) {
    return <span className="text-sm text-hierro-400">{mensajeVacio}</span>;
  }

  return (
    // Se limita el ancho para evitar que los textos no ensanchen la tabla.
    <div className={className}>
      {/* Se muestra dos líneas inicialmente y el texto completo al expandir. */}
      <p
        ref={textoRef}
        className={`break-words text-sm text-hierro-200 ${
          // Contrae el texto a dos líneas, salvo que el usuario lo expanda.
          expandida ? "" : "line-clamp-2"
        }`}
      >
        {contenido}
      </p>

      {/* Solo se muestra el botón cuando el texto podría necesitar expansión. */}
      {necesitaExpandir ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-1"
          // Informa si el contenido de esta fila está expandido.
          aria-expanded={expandida}
          // Cambia el estado únicamente para este texto.
          onPress={() => setExpandida((actual) => !actual)}
        >
          {expandida ? "Ver menos" : "Ver completa"}
        </Button>
      ) : null}
    </div>
  );
}

export default TextoExpandible;
