import type { RespuestaApi } from '@/src/tipos/api';
import type { Evento } from '@/src/tipos/evento';

export interface FiltrosEventos {
  /** ISO con zona: solo eventos que empiezan desde acá (inclusive). */
  desde?: string;
  /** ISO con zona: solo eventos que empiezan antes de acá. */
  hasta?: string;
}

/**
 * Puerto de la agenda. Devuelve la forma de la API (`datos` + `meta` o
 * `error`). Una falla de red se representa con `Promise.reject`.
 */
export interface ServicioEventos {
  listarEventos(filtros?: FiltrosEventos): Promise<RespuestaApi<Evento[]>>;
  obtenerEvento(id: string): Promise<RespuestaApi<Evento>>;
}
