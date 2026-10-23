import { useSyncExternalStore } from 'react';

/**
 * Mini-almacén observable (sin librerías): varias pantallas leen el
 * mismo estado (lista y detalle de la agenda, Mi recorrido y su detalle)
 * y se re-renderizan cuando cambia. Se usa con `useAlmacen`.
 */
export interface Almacen<T> {
  obtener(): T;
  actualizar(cambio: Partial<T> | ((previo: T) => Partial<T>)): void;
  suscribir(oyente: () => void): () => void;
}

export function crearAlmacen<T extends object>(inicial: T): Almacen<T> {
  let estado = inicial;
  const oyentes = new Set<() => void>();
  return {
    obtener: () => estado,
    actualizar(cambio) {
      const parcial = typeof cambio === 'function' ? cambio(estado) : cambio;
      estado = { ...estado, ...parcial };
      oyentes.forEach((o) => o());
    },
    suscribir(oyente) {
      oyentes.add(oyente);
      return () => oyentes.delete(oyente);
    },
  };
}

export function useAlmacen<T>(almacen: Almacen<T>): T {
  return useSyncExternalStore(almacen.suscribir, almacen.obtener, almacen.obtener);
}
