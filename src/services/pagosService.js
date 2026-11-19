import { api } from "./api";

export const pagosService = {
  // Historial paginado con filtros (pantalla de gestión de pagos).
  consultarHistorial: async ({
    alumno = "",
    estado = "TODOS",
    fechaDesde = "",
    fechaHasta = "",
    page = 0,
    size = 10,
  }) => {
    const params = new URLSearchParams();
    if (alumno) params.append("alumno", alumno);
    if (estado && estado !== "TODOS") params.append("estado", estado);
    if (fechaDesde) params.append("fechaDesde", fechaDesde);
    if (fechaHasta) params.append("fechaHasta", fechaHasta);
    params.append("page", page);
    params.append("size", size);

    const respuesta = await api.get(`/api/pagos?${params.toString()}`);
    return respuesta.data;
  },

  // Registrar un pago: multipart con la parte "pago" (JSON) y "comprobante" (opcional).
  registrarPago: async (datosPago, archivoComprobante = null) => {
    const formData = new FormData();
    formData.append(
      "pago",
      new Blob([JSON.stringify(datosPago)], { type: "application/json" }),
    );
    if (archivoComprobante) {
      formData.append("comprobante", archivoComprobante);
    }

    // Sin Content-Type manual: axios agrega solo el boundary del multipart.
    const respuesta = await api.post("/api/pagos", formData, { timeout: 30000 });
    return respuesta.data;
  },

  anularPago: async (idPago, motivoData) => {
    const respuesta = await api.patch(`/api/pagos/${idPago}/anular`, motivoData);
    return respuesta.data;
  },

  // Descargar el comprobante como blob.
  descargarComprobante: async (idPago) => {
    const respuesta = await api.get(`/api/pagos/${idPago}/comprobante`, {
      responseType: "blob",
    });
    return respuesta.data;
  },
};