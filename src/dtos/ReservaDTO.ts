export interface ReservaDTO {
  id: number;
  estado: "CONFIRMADA" | "PENDIENTE" | "CANCELADA";
  totalPago: number;
  createdAt: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  canchaNombre: string;
  tipoCancha: string;
  sede: string;
  usuarioId: number;
  usuarioNombre: string;
  usuarioCorreo: string;
}
