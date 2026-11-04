import { useCallback, useEffect, useState } from 'react';

import { MENSAJE_PROBLEMA_SERVIDOR } from '@/src/servicios/api/mensajes';
import { servicioLugares as servicioLugaresPorDefecto } from '@/src/servicios/lugares';
import type { ServicioLugares, FiltrosLugares } from '@/src/servicios/lugares/ServicioLugares';
import { ErrorDeServicio } from '@/src/tipos/api';
import type { Lugar } from '@/src/tipos/lugar';

export type EstadoCarga = 'cargando' | 'listo' | 'error';

export interface CatalogoLugares {
  /** Solo lugares activos: los inactivos nunca deben llegar a mapa ni lista. */
  lugares: Lugar[];
  estado: EstadoCarga;
  mensajeError: string | null;
  reintentar: () => void;
}

/** Trae el catálogo desde la API y expone cargando, listo o error de servidor. */
export function useLugares(
  filtros?: FiltrosLugares,
  servicio: ServicioLugares = servicioLugaresPorDefecto
): CatalogoLugares {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>('cargando');
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setEstado('cargando');

    servicio
      .listarLugares()
      .then((resultado) => {
        if (cancelado) return;
        setLugares(resultado.filter((lugar) => lugar.activo) as Lugar[]);
        setMensajeError(null);
        setEstado('listo');
      })
      .catch((e: unknown) => {
        if (cancelado) return;
        const mensaje = e instanceof ErrorDeServicio ? e.message : MENSAJE_PROBLEMA_SERVIDOR;
        setMensajeError(mensaje);
        setEstado('error');
        setLugares([]);
      });

    return () => {
      cancelado = true;
    };
  }, [servicio, intento, filtros?.busqueda, filtros?.categoriaId]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  return { lugares, estado, mensajeError, reintentar };
}
