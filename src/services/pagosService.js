import { api } from "./api";

export const pagosService = {
  // Consultar historial paginado de pagos con filtros
  consultarHistorial: async ({
    alumno = "",
    planId = "",
    estado = "TODOS",
    fechaDesde = "",
    fechaHasta = "",
    page = 0,
    size = 10,
  }) => {
    const params = new URLSearchParams();
    if (alumno) params.append("alumno", alumno);
    if (planId) params.append("planId", planId);
    if (estado && estado !== "TODOS") params.append("estado", estado);
    if (fechaDesde) params.append("fechaDesde", fechaDesde);
    if (fechaHasta) params.append("fechaHasta", fechaHasta);
    params.append("page", page);
    params.append("size", size);

    const respuesta = await clienteAxios.get(`/pagos?${params.toString()}`);
    return respuesta.data;
  },

  // Registrar un pago (admite multipart/form-data por el comprobante en MinIO)
  registrarPago: async (datosPago, archivoComprobante = null) => {
    const formData = new FormData();
    formData.append(
      "pago",
      new Blob([JSON.stringify(datosPago)], { type: "application/json" })
    );

    if (archivoComprobante) {
      formData.append("comprobante", archivoComprobante);
    }

    const respuesta = await clienteAxios.post("/pagos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return respuesta.data;
  },

  // Anular un pago
  anularPago: async (idPago, motivoData) => {
    const respuesta = await clienteAxios.put(`/pagos/${idPago}/anular`, motivoData);
    return respuesta.data;
  },

  // Obtener URL/Archivo del comprobante
  descargarComprobante: async (idPago) => {
    const respuesta = await clienteAxios.get(`/pagos/${idPago}/comprobante`, {
      responseType: "blob",
    });
    return respuesta.data;
  },
};