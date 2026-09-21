import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { removerSuscripcionConSeguridad } from '@/src/utils/suscripciones';

const CALIBRACION_MINIMA = 1; // 0 = sin calibrar, según LocationHeadingObject.accuracy

export interface RumboDispositivo {
  /** Rumbo del celular en grados (0-360), o null si todavía no hay lectura. */
  rumboGrados: number | null;
  /** false si el magnetómetro no está disponible o está sin calibrar: la flecha debe ocultarse. */
  disponible: boolean;
}

/**
 * Rumbo (orientación) del dispositivo vía brújula. Se apoya en
 * `expo-location.watchHeadingAsync`, que ya combina el magnetómetro con
 * la corrección de norte verdadero y expone el nivel de calibración, en
 * vez de leer expo-sensors.Magnetometer crudo y tener que reimplementar
 * ese cálculo. No hay brújula real en un navegador de escritorio, así que
 * en web no se intenta suscribir: la flecha se oculta directamente.
 */
export function useRumboDispositivo(): RumboDispositivo {
  const [rumbo, setRumbo] = useState<number | null>(null);
  const [disponible, setDisponible] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let cancelado = false;
    let suscripcion: Location.LocationSubscription | null = null;

    Location.watchHeadingAsync(
      (heading) => {
        if (cancelado) return;
        const calibrado = heading.accuracy >= CALIBRACION_MINIMA;
        setDisponible(calibrado);
        setRumbo(calibrado ? heading.trueHeading : null);
      },
      () => {
        if (!cancelado) setDisponible(false);
      }
    )
      .then((s) => {
        if (cancelado) {
          removerSuscripcionConSeguridad(s);
        } else {
          suscripcion = s;
        }
      })
      .catch(() => {
        if (!cancelado) setDisponible(false);
      });

    return () => {
      cancelado = true;
      if (suscripcion) removerSuscripcionConSeguridad(suscripcion);
    };
  }, []);

  return { rumboGrados: rumbo, disponible };
}
