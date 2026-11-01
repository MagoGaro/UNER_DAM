import type { Coordenadas } from '@/src/tipos/coordenadas';
import type { Lugar } from '@/src/tipos/lugar';
import { distanciaMetros } from '@/src/utils/geo';

/**
 * A cuántos metros hay que estar para registrar una visita "estando
 * físicamente cerca". 150 m alcanza para el frente de un lugar grande
 * (termas, parque) sin dejar registrar desde el hotel. Pendiente de
 * confirmar con Valeria.
 */
export const RADIO_REGISTRO_GPS_METROS = 150;

/** Si la precisión del GPS es peor que esto, no confiamos en la lectura. */
export const PRECISION_MAXIMA_METROS = 100;

export interface LugarConDistancia {
  lugar: Lugar;
  distanciaMetros: number;
}

/** Lugares activos ordenados por distancia a `posicion`. */
export function ordenarPorDistancia(posicion: Coordenadas, lugares: readonly Lugar[]): LugarConDistancia[] {
  return lugares
    .filter((l) => l.activo)
    .map((lugar) => ({ lugar, distanciaMetros: distanciaMetros(posicion, lugar.coordenadas) }))
    .sort((a, b) => a.distanciaMetros - b.distanciaMetros);
}

export type ResultadoCercania =
  | { tipo: 'cerca'; candidatos: LugarConDistancia[] }
  | { tipo: 'lejos'; masCercano: LugarConDistancia | null };

/**
 * Lugares dentro del radio de registro (puede haber más de uno, por
 * ejemplo la feria y el restaurante de enfrente: el turista elige).
 */
export function lugaresParaRegistrar(
  posicion: Coordenadas,
  lugares: readonly Lugar[],
  radio = RADIO_REGISTRO_GPS_METROS
): ResultadoCercania {
  const ordenados = ordenarPorDistancia(posicion, lugares);
  const candidatos = ordenados.filter((l) => l.distanciaMetros <= radio);
  if (candidatos.length > 0) return { tipo: 'cerca', candidatos };
  return { tipo: 'lejos', masCercano: ordenados[0] ?? null };
}
