import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Lugar } from '@/src/tipos/lugar';
import {
  borrarAudioguia,
  descargarAudioguia,
  elegirFuente,
  estaIncluidaEnLaApp,
  rutaAudioguiaLocal,
  type FuenteAudio,
} from './audioguias';

export type EstadoAudioOffline = 'sin-audioguia' | 'incluida' | 'no-descargada' | 'descargando' | 'descargada';

export interface AudioguiaOffline {
  estado: EstadoAudioOffline;
  /** De dónde reproducir ahora (app, teléfono o internet). */
  fuente: FuenteAudio | null;
  error: string | null;
  descargar: () => Promise<void>;
  quitar: () => void;
}

/** Estado de la audioguía de un lugar respecto del uso sin señal. */
export function useAudioguiaOffline(lugar: Lugar | null): AudioguiaOffline {
  const [uriLocal, setUriLocal] = useState<string | null>(null);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lugarId = lugar?.id ?? null;
  const url = lugar?.audioguia?.url ?? null;

  useEffect(() => {
    setError(null);
    setUriLocal(lugar ? rutaAudioguiaLocal(lugar) : null);
    // Solo depende de qué lugar y qué archivo es.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lugarId, url]);

  const descargar = useCallback(async () => {
    if (!lugar) return;
    setDescargando(true);
    setError(null);
    try {
      setUriLocal(await descargarAudioguia(lugar));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo descargar.');
    } finally {
      setDescargando(false);
    }
  }, [lugar]);

  const quitar = useCallback(() => {
    if (!lugar) return;
    borrarAudioguia(lugar);
    setUriLocal(null);
  }, [lugar]);

  const fuente = useMemo(
    () => (lugarId ? elegirFuente({ lugarId, urlRemota: url, uriLocal }) : null),
    [lugarId, url, uriLocal]
  );

  let estado: EstadoAudioOffline = 'no-descargada';
  if (!url && !(lugarId && estaIncluidaEnLaApp(lugarId))) estado = 'sin-audioguia';
  else if (lugarId && estaIncluidaEnLaApp(lugarId)) estado = 'incluida';
  else if (descargando) estado = 'descargando';
  else if (uriLocal) estado = 'descargada';

  return { estado, fuente, error, descargar, quitar };
}
