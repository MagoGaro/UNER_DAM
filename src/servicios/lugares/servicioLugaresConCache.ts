import { guardarJSON, leerJSON, type KVStore } from '@/src/almacenamiento/kvStore';
import type { Lugar } from '@/src/tipos/lugar';
import { filtrarLugares } from './filtrarLugares';
import type { FiltrosLugares, ServicioLugares } from './ServicioLugares';

const CLAVE = 'catalogo.lugares';

/**
 * Envuelve cualquier ServicioLugares y guarda el catálogo en el teléfono
 * cada vez que se lo pudo traer. Si después no hay señal (costanera,
 * El Palmar), sirve lo último guardado: la persona que abrió la app en el
 * hotel sigue viendo los lugares. Si nunca se pudo traer, el error sube
 * tal cual para que la pantalla muestre «reintentar».
 */
export class ServicioLugaresConCache implements ServicioLugares {
  constructor(
    private readonly interno: ServicioLugares,
    private readonly kv: KVStore
  ) {}

  async listarLugares(filtros?: FiltrosLugares): Promise<readonly Lugar[]> {
    try {
      const lista = await this.interno.listarLugares(filtros);
      if (!filtros?.categoriaId && !filtros?.busqueda) {
        await guardarJSON(this.kv, CLAVE, lista);
      }
      return lista;
    } catch (error) {
      const guardados = await leerJSON<Lugar[] | null>(this.kv, CLAVE, null);
      if (!guardados) throw error;
      return filtrarLugares(guardados, filtros);
    }
  }

  async obtenerPorId(id: string): Promise<Lugar | null> {
    try {
      return await this.interno.obtenerPorId(id);
    } catch (error) {
      const guardados = await leerJSON<Lugar[] | null>(this.kv, CLAVE, null);
      if (!guardados) throw error;
      return guardados.find((l) => l.id === id) ?? null;
    }
  }
}
