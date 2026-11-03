import type { RespuestaApi } from '@/src/tipos/api';
import type { Favorito } from '@/src/tipos/favorito';

/**
 * Puerto de favoritos en el servidor (los que siguen si cambia de teléfono).
 * La API los maneja por lugar: `PUT` y `DELETE /yo/favoritos/:lugarId`.
 */
export interface ServicioFavoritos {
  listar(usuarioId: string): Promise<RespuestaApi<Favorito[]>>;
  agregar(usuarioId: string, lugarId: string): Promise<RespuestaApi<Favorito>>;
  quitar(usuarioId: string, lugarId: string): Promise<RespuestaApi<null>>;
}
