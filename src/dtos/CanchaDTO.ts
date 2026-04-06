export interface CanchaDTO {
  id: number;
  nombre: string;
  descripcion: string;
  capacidad: number;
  imagen: string;
  precioHora: number;
  activa: boolean;
  sedeId: number;
  sedeNombre: string;
  tipoCanchaId: number;
  tipoCanchaNombre: string;
}