import type { RespuestaApi } from '@/src/tipos/api';
import type { Visita } from '@/src/tipos/visita';

/** Lado servidor de las visitas: `POST /archivos`, `POST` y `GET /yo/visitas`. */
export interface ServicioVisitasApi {
  subirVisita(visita: Visita): Promise<RespuestaApi<Visita>>;
  eliminarVisita(id: string): Promise<RespuestaApi<null>>;
  /** Las visitas de la cuenta (para recuperar el recorrido en otro teléfono). */
  listarVisitas?(): Promise<RespuestaApi<Visita[]>>;
}
