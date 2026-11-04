import type { Lugar } from '@/src/tipos/lugar';




/** Puerto del catálogo de lugares. Las pantallas dependen de esta interfaz. */

export interface FiltrosLugares {
  categoriaId? : string;
  busqueda? : string;
}
export interface ServicioLugares {
  listarLugares(filtros?: FiltrosLugares): Promise<readonly Lugar[]>;
  obtenerPorId(id: string): Promise<Lugar | null>;
  /** `GET /lugares/qr/:codigo` con el texto del cartel (`COLON:lug-004`). */
  obtenerPorQr(codigo: string): Promise<Lugar | null>;
}
