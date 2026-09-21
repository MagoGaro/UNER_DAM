import { useEffect, useRef } from 'react';

import { precisionSuficientePara } from '@/src/configuracion/preferenciasPorDefecto';
import { servicioAvisosProximidadExpo } from '@/src/notificaciones/servicioAvisosProximidadExpo';
import type { ServicioAvisosProximidad } from '@/src/notificaciones/ServicioAvisosProximidad';
import type { Coordenadas } from '@/src/tipos/coordenadas';
import type { Lugar } from '@/src/tipos/lugar';
import type { Preferencias } from '@/src/tipos/preferencias';
import { distanciaMetros, marcarAviso, yaAviseHoy } from '@/src/utils/geo';

const registroAvisosPorDefecto = { yaAviseHoy, marcarAviso };

interface ParametrosAvisosProximidad {
  lugares: Lugar[];
  posicion: Coordenadas | null;
  precisionMetros: number | null;
  preferencias: Preferencias;
  servicioAvisos?: ServicioAvisosProximidad;
  registroAvisos?: typeof registroAvisosPorDefecto;
}

/**
 * Efecto puro (no devuelve nada): en cada actualización de posición,
 * revisa qué lugares activos quedaron dentro del radio configurado y, si
 * todavía no avisaron hoy, dispara la notificación + vibración una sola
 * vez por lugar y por día (tareas 7, 8 y 9 del seguimiento).
 *
 * `servicioAvisos` y `registroAvisos` se pueden inyectar para tests; en
 * producción usan las implementaciones reales por defecto.
 */
export function useAvisosProximidad({
  lugares,
  posicion,
  precisionMetros,
  preferencias,
  servicioAvisos = servicioAvisosProximidadExpo,
  registroAvisos = registroAvisosPorDefecto,
}: ParametrosAvisosProximidad): void {
  const lugaresEnProcesoRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!preferencias.avisarProximidad || !posicion) return;
    if (!precisionSuficientePara(precisionMetros, preferencias.radioAvisoMetros)) return;

    let cancelado = false;

    async function revisarLlegadas() {
      const lugaresCercanos = lugares.filter(
        (lugar) =>
          lugar.activo &&
          !lugaresEnProcesoRef.current.has(lugar.id) &&
          distanciaMetros(posicion as Coordenadas, lugar.coordenadas) <= preferencias.radioAvisoMetros
      );

      for (const lugar of lugaresCercanos) {
        lugaresEnProcesoRef.current.add(lugar.id);
        try {
          if (await registroAvisos.yaAviseHoy(lugar.id)) continue;
          if (cancelado) return;

          const tienePermiso = await servicioAvisos.pedirPermiso();
          if (!tienePermiso || cancelado) continue;

          await servicioAvisos.avisarLlegada(lugar);
          await registroAvisos.marcarAviso(lugar.id);
        } finally {
          lugaresEnProcesoRef.current.delete(lugar.id);
        }
      }
    }

    revisarLlegadas();

    return () => {
      cancelado = true;
    };
  }, [lugares, posicion, precisionMetros, preferencias, servicioAvisos, registroAvisos]);
}
