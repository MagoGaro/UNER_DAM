import type { RespuestaApi } from '@/src/tipos/api';
import type { Evento } from '@/src/tipos/evento';

export interface FiltrosEventos {
  /** ISO con zona: solo eventos que empiezan desde acá (inclusive). */
  desde?: string;
  /** ISO con zona: solo eventos que empiezan antes de acá. */
  hasta?: string;
}

/**
 * Puerto de la agenda. Las pantallas dependen de esta interfaz y nunca
 * del mock. Devuelve siempre la forma de la API (`datos` + `meta` o
 * `error`) y es asíncrono desde el día uno, aunque el mock responda al
 * instante. Una falla de red se representa con `Promise.reject`.
 */
export interface ServicioEventos {
  listarEventos(filtros?: FiltrosEventos): Promise<RespuestaApi<Evento[]>>;
  obtenerEvento(id: string): Promise<RespuestaApi<Evento>>;
}
