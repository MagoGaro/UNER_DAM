import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { Coordenadas } from '@/src/tipos/coordenadas';
import { removerSuscripcionConSeguridad } from '@/src/utils/suscripciones';

export type EstadoPosicion = 'cargando' | 'concedido' | 'denegado' | 'error';

export interface PosicionUsuario {
  estado: EstadoPosicion;
  posicion: Coordenadas | null;
  /** Radio de incertidumbre en metros, o null si todavía no se sabe. */
  precisionMetros: number | null;
  /** Vuelve a pedir permiso y a suscribirse a la ubicación (caso "permiso denegado" con botón reintentar). */
  reintentar: () => void;
}

/**
 * Ubicación del usuario en vivo, con manejo explícito de permiso denegado
 * y error, para que la pantalla pueda mostrar el mapa igual (sin punto
 * del usuario) en vez de romperse.
 */
export function usePosicionUsuario(): PosicionUsuario {
  const [estado, setEstado] = useState<EstadoPosicion>('cargando');
  const [posicion, setPosicion] = useState<Coordenadas | null>(null);
  const [precisionMetros, setPrecisionMetros] = useState<number | null>(null);
  const [intento, setIntento] = useState(0);
  const suscripcionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function iniciar() {
      setEstado('cargando');
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelado) return;

        if (status !== 'granted') {
          setEstado('denegado');
          return;
        }

        suscripcionRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 4000, distanceInterval: 10 },
          (ubicacion) => {
            setPosicion({
              latitud: ubicacion.coords.latitude,
              longitud: ubicacion.coords.longitude,
            });
            setPrecisionMetros(ubicacion.coords.accuracy);
            setEstado('concedido');
          },
          () => setEstado('error')
        );
      } catch {
        if (!cancelado) setEstado('error');
      }
    }

    iniciar();

    return () => {
      cancelado = true;
      if (suscripcionRef.current) removerSuscripcionConSeguridad(suscripcionRef.current);
      suscripcionRef.current = null;
    };
  }, [intento]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  return { estado, posicion, precisionMetros, reintentar };
}
