import { useMemo } from 'react';

import type { Lugar } from '@/src/tipos/lugar';
import { useLugares } from './useLugares';

/** Catálogo como diccionario id → Lugar, para mostrar nombres en Agenda y Mi recorrido. */
export function useCatalogoLugares() {
  const { lugares, estado, reintentar } = useLugares();
  const porId = useMemo(() => {
    const mapa: Record<string, Lugar> = {};
    for (const l of lugares) mapa[l.id] = l;
    return mapa;
  }, [lugares]);
  return { lugares, porId, estado, reintentar };
}
