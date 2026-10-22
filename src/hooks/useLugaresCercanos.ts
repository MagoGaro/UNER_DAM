import { useMemo } from 'react';

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
  lugares: LugarCercano[];
}

/** Normaliza la categoría quitando 'cat-', minúsculas y la 's' del plural (ej: 'cat-playas' -> 'playa') */
function normalizarCategoria(catRaw: any): string {
  if (!catRaw) return '';
  const texto = typeof catRaw === 'object' 
    ? (catRaw.categoriaId || catRaw.categoria || catRaw.id || '') 
    : String(catRaw);

  return texto
    .replace(/^cat-/, '')
    .toLowerCase()
    .trim()
    .replace(/s$/, '');
}

/** Compara la categoría del lugar con el filtro seleccionado */
function coincideCategoria(lugar: any, categoriaSeleccionada: Categoria | null): boolean {
  if (!categoriaSeleccionada) return true;

  const filtroLimpio = normalizarCategoria(categoriaSeleccionada);
  if (!filtroLimpio || filtroLimpio === 'todo') return true;

  // Lee 'categoriaId' de LUGARES_DE_PRUEBA o 'categoria' según corresponda
  const catLugar = lugar.categoriaId ?? lugar.categoria;
  const lugarLimpio = normalizarCategoria(catLugar);

  return lugarLimpio === filtroLimpio;
}

export function useLugaresCercanos(
  posicion: Coordenadas | null,
  categoriaSeleccionada: Categoria | null
): LugaresCercanos {
  const { lugares, estado, reintentar } = useLugares();

  const lugaresOrdenados = useMemo<LugarCercano[]>(() => {
    const filtrados = lugares.filter((lugar) =>
      coincideCategoria(lugar, categoriaSeleccionada)
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

  return { lugares: lugaresOrdenados, estado, reintentar };
}