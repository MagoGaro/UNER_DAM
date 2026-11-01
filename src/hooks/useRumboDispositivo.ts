import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { rumboDesdeMagnetometro } from '@/src/utils/brujula';
import { removerSuscripcionConSeguridad } from '@/src/utils/suscripciones';

const CALIBRACION_MINIMA = 1; // 0 = sin calibrar, según LocationHeadingObject.accuracy

export interface RumboDispositivo {
  /** Rumbo del celular en grados (0-360), o null si todavía no hay lectura. */
  rumboGrados: number | null;
  /** false si el magnetómetro no está disponible o está sin calibrar: la flecha debe ocultarse. */
  disponible: boolean;
}

/**
 * Rumbo (orientación) del dispositivo vía brújula. Primero usa
 * `expo-location.watchHeadingAsync`, que ya combina el magnetómetro con
 * la corrección de norte verdadero y expone el nivel de calibración. Si
 * eso falla o no existe en el teléfono, cae al magnetómetro crudo de
 * `expo-sensors` (ver `utils/brujula.ts`). No hay brújula real en un
 * navegador de escritorio, así que en web no se intenta suscribir: la
 * flecha se oculta directamente.
 */
export function useRumboDispositivo(): RumboDispositivo {
  const [rumbo, setRumbo] = useState<number | null>(null);
  const [disponible, setDisponible] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let cancelado = false;
    let suscripcion: Location.LocationSubscription | null = null;
    let respaldo: { remove(): void } | null = null;

    const iniciarRespaldo = async () => {
      if (cancelado || respaldo) return;
      try {
        if (!(await Magnetometer.isAvailableAsync()) || cancelado) {
          if (!cancelado) setDisponible(false);
          return;
        }
        Magnetometer.setUpdateInterval(250);
        respaldo = Magnetometer.addListener((lectura) => {
          if (cancelado) return;
          const r = rumboDesdeMagnetometro(lectura);
          setRumbo(r);
          setDisponible(r !== null);
        });
      } catch {
        if (!cancelado) setDisponible(false);
      }
    };

    Location.watchHeadingAsync(
      (heading) => {
        if (cancelado) return;
        const calibrado = heading.accuracy >= CALIBRACION_MINIMA;
        setDisponible(calibrado);
        setRumbo(calibrado ? heading.trueHeading : null);
      },
      () => {
        if (!cancelado) iniciarRespaldo();
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
        if (!cancelado) iniciarRespaldo();
      });

    return () => {
      cancelado = true;
      if (suscripcion) removerSuscripcionConSeguridad(suscripcion);
      if (respaldo) removerSuscripcionConSeguridad(respaldo);
    };
  }, []);

  return { rumboGrados: rumbo, disponible };
}
