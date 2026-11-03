import type { RespuestaApi } from '@/src/tipos/api';
import type { Visita } from '@/src/tipos/visita';

/**
 * Lado servidor de las visitas. Hoy es un mock; cuando llegue la API de
 * la cátedra se implementa con `fetch` (POST /visitas, con la cabecera
 * `Authorization: Bearer <token>` leída de expo-secure-store).
 */
export interface ServicioVisitasApi {
  subirVisita(visita: Visita): Promise<RespuestaApi<Visita>>;
  eliminarVisita(id: string): Promise<RespuestaApi<null>>;
  /** Las visitas de la cuenta (para recuperar el recorrido en otro teléfono). Opcional en los mocks. */
  listarVisitas?(): Promise<RespuestaApi<Visita[]>>;
}
