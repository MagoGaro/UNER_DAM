import { useCallback, useEffect, useState } from 'react';

import { servicioLugares as servicioLugaresPorDefecto } from '@/src/servicios/lugares';
import type { ServicioLugares, FiltrosLugares } from '@/src/servicios/lugares/ServicioLugares';
import type { Lugar } from '@/src/tipos/lugar';

export type EstadoCarga = 'cargando' | 'listo' | 'error';

export interface CatalogoLugares {
  /** Solo lugares activos: los inactivos nunca deben llegar a mapa ni lista. */
  lugares: Lugar[];
  estado: EstadoCarga;
  reintentar: () => void;
}

/**
 * Trae el catálogo de lugares desde `ServicioLugares` (hoy el mock de
 * prueba, mañana el servicio real del Integrante 1) y expone
 * cargando/listo/error con reintento, para el caso "error de red del
 * servicio" del seguimiento.
 */
export function useLugares(
  filtros?: FiltrosLugares,
  servicio: ServicioLugares = servicioLugaresPorDefecto
): CatalogoLugares{
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>('cargando');
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setEstado('cargando');

    servicio
      .listarLugares()
      .then((resultado) => {
        if (cancelado) return;
        setLugares(resultado.filter((lugar) => lugar.activo)as Lugar[]);
        setEstado('listo');
      })
      .catch(() => {
        if (!cancelado) setEstado('error');
      });

    return () => {
      cancelado = true;
    };
  }, [servicio, intento, filtros?.busqueda, filtros?.categoriaId]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  return { lugares, estado, reintentar };
}
