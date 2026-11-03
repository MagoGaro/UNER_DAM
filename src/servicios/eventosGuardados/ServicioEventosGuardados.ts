import type { RespuestaApi } from '@/src/tipos/api';
import type { Evento } from '@/src/tipos/evento';

/**
 * Eventos guardados en la cuenta. Sirven para que la API sepa a quién
 * avisar cuando un evento se suspende o se cancela, y para recuperarlos
 * en otro teléfono. Todo es best-effort: la agenda manda el teléfono.
 */
export interface ServicioEventosGuardados {
  listar(): Promise<RespuestaApi<Evento[]>>;
  guardar(eventoId: string): Promise<RespuestaApi<unknown>>;
  quitar(eventoId: string): Promise<RespuestaApi<unknown>>;
}
