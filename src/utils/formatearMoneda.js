/* Formateador numérico nativo de JS (Intl.NumberFormat) adaptado a la región 
de Argentina (es-AR) para mostrar precios en pesos con dos decimales. */
export function formatearMoneda(importe) {
  return new Intl.NumberFormat("es-AR", {
    // El número debe formatearse como una cantidad monetaria (incluyendo el símbolo de la moneda).
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(importe);
}