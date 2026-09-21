import type { Coordenadas } from '@/src/tipos/coordenadas';
import { marcarAviso, yaAviseHoy } from '@/src/almacenamiento/registroAvisosDiarios';

const RADIO_TIERRA_METROS = 6_371_000;

function aRadianes(grados: number): number {
  return (grados * Math.PI) / 180;
}

/** Distancia entre dos coordenadas, en metros, usando la fórmula de haversine. */
export function distanciaMetros(a: Coordenadas, b: Coordenadas): number {
  const dLat = aRadianes(b.latitud - a.latitud);
  const dLon = aRadianes(b.longitud - a.longitud);
  const lat1 = aRadianes(a.latitud);
  const lat2 = aRadianes(b.latitud);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return RADIO_TIERRA_METROS * c;
}

/** Rumbo inicial (0-360°) desde `desde` hacia `hasta`, medido desde el norte geográfico. */
export function rumboGrados(desde: Coordenadas, hasta: Coordenadas): number {
  const lat1 = aRadianes(desde.latitud);
  const lat2 = aRadianes(hasta.latitud);
  const dLon = aRadianes(hasta.longitud - desde.longitud);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const rumbo = (Math.atan2(y, x) * 180) / Math.PI;

  return (rumbo + 360) % 360;
}

/** «900 m» por debajo de 1 km; «1,4 km» con coma decimal a partir de 1 km. */
export function formatearDistancia(metros: number): string {
  if (metros < 1000) {
    return `${Math.round(metros)} m`;
  }
  const km = (metros / 1000).toFixed(1).replace('.', ',');
  return `${km} km`;
}

/**
 * Registro de avisos de proximidad ya enviados hoy (tarea 8: máximo un
 * aviso por lugar y por día). La persistencia vive en
 * src/almacenamiento/registroAvisosDiarios.ts, separada del cálculo
 * geométrico; este archivo solo reexporta la firma que pide el
 * seguimiento del equipo para que quien lo use importe todo desde
 * `src/utils/geo`.
 */
export { marcarAviso, yaAviseHoy };
