import type { Lugar } from '@/src/tipos/lugar';




/**
 * Puerto que expone el catálogo de lugares. Los componentes y hooks de
 * esta parte dependen únicamente de esta interfaz (principio de
 * inversión de dependencias), nunca del mock ni de una implementación
 * concreta, para que el Integrante 1 pueda enchufar `listarLugares()` del
 * servicio real sin que el resto del código cambie.
 */

export interface FiltrosLugares {
  categoriaId? : string;
  busqueda? : string;
}
export interface ServicioLugares {
  listarLugares(filtros?: FiltrosLugares): Promise<readonly Lugar[]>;
  obtenerPorId(id: string): Promise<Lugar | null>;
}
