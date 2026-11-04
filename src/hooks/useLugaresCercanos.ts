import { useMemo } from 'react';

import type { Coordenadas } from '@/src/tipos/coordenadas';
import type { Lugar } from '@/src/tipos/lugar';
import { distanciaMetros, formatearDistancia } from '@/src/utils/geo';
import { type CatalogoLugares, useLugares } from './useLugares';

export interface LugarCercano extends Lugar {
  distanciaMetros: number | null;
  distanciaFormateada: string | null;
}

export interface LugaresCercanos extends Omit<CatalogoLugares, 'lugares'> {
  lugares: LugarCercano[];
}

export function useLugaresCercanos(
  posicion: Coordenadas | null,
  categoriaSeleccionada: string | null
): LugaresCercanos {
  const { lugares, estado, mensajeError, reintentar } = useLugares();

  const lugaresOrdenados = useMemo<LugarCercano[]>(() => {
    const filtrados = lugares.filter(
      (lugar) => !categoriaSeleccionada || lugar.categoriaId === categoriaSeleccionada
    );

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

  return { lugares: lugaresOrdenados, estado, mensajeError, reintentar };
}
