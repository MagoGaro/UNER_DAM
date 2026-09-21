import { useMemo } from 'react';

import type { ServicioLugares } from '@/src/servicios/lugares/ServicioLugares';
import type { Categoria } from '@/src/tipos/categoria';
import type { Coordenadas } from '@/src/tipos/coordenadas';
import type { Lugar } from '@/src/tipos/lugar';
import { distanciaMetros, formatearDistancia } from '@/src/utils/geo';
import { type CatalogoLugares, useLugares } from './useLugares';

export interface LugarCercano extends Lugar {
  distanciaMetros: number | null;
  distanciaFormateada: string | null;
}

export interface LugaresCercanos extends Omit<CatalogoLugares, 'lugares'> {
  /**
   * Lugares activos, filtrados por categoría si se pidió, ordenados por
   * distancia cuando hay posición del usuario, o por nombre cuando no
   * (caso "permiso de ubicación denegado" del seguimiento).
   */
  lugares: LugarCercano[];
}

/** Lista «Cerca tuyo» y catálogo para el mapa: mismo dato, ordenado distinto según haya o no posición. */
export function useLugaresCercanos(
  posicion: Coordenadas | null,
  categoriaSeleccionada: Categoria | null,
  servicio?: ServicioLugares
): LugaresCercanos {
  const { lugares, estado, reintentar } = useLugares(servicio);

  const lugaresOrdenados = useMemo<LugarCercano[]>(() => {
    const filtrados = categoriaSeleccionada
      ? lugares.filter((lugar) => lugar.categoria === categoriaSeleccionada)
      : lugares;

    const conDistancia: LugarCercano[] = filtrados.map((lugar) => {
      const distancia = posicion ? distanciaMetros(posicion, lugar.coordenadas) : null;
      return {
        ...lugar,
        distanciaMetros: distancia,
        distanciaFormateada: distancia !== null ? formatearDistancia(distancia) : null,
      };
    });

    return posicion
      ? conDistancia.sort((a, b) => a.distanciaMetros! - b.distanciaMetros!)
      : conDistancia.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }, [lugares, posicion, categoriaSeleccionada]);

  return { lugares: lugaresOrdenados, estado, reintentar };
}
