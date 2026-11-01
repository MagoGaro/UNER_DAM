import type { Coordenadas } from './coordenadas';

/** Tipos tal cual el pedido de Valeria (página 10). No se tocan cuando llegue la API. */
export type EstadoEvento = 'programado' | 'suspendido' | 'cancelado' | 'finalizado';

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  lugarId: string | null;
  direccionLibre: string | null;
  coordenadas: Coordenadas | null;
  /** ISO 8601 con zona, ej. "2026-11-14T21:00:00-03:00". */
  inicio: string;
  /** ISO 8601 con zona, o null si no tiene hora de fin conocida. */
  fin: string | null;
  imagenUrl: string | null;
  /** Pesos. 0 = gratis, null = no aplica / no informado. */
  precio: number | null;
  estado: EstadoEvento;
}
