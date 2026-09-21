import type { Preferencias } from '@/src/tipos/preferencias';

/**
 * Valores por defecto mientras el Integrante 3 no entregue Preferencias
 * real (Cuenta y Favoritos). Cuando exista, esta parte debe leer las
 * preferencias reales del usuario en vez de esta constante.
 */
export const PREFERENCIAS_POR_DEFECTO: Preferencias = {
  avisarProximidad: true,
  radioAvisoMetros: 250,
};

/**
 * A partir de cuántos metros se considera que un lugar está «lejos» y
 * conviene mostrar la flecha de orientación en vez de confiar en el
 * mapa. Pendiente de confirmar con Valeria (pregunta 4 del seguimiento);
 * es un único valor acá para poder ajustarlo sin tocar componentes.
 */
export const UMBRAL_LEJOS_METROS = 300;

/**
 * Margen de precisión del GPS: si la precisión reportada es peor que el
 * radio de aviso, no se dispara el aviso de proximidad (caso "GPS
 * impreciso" del seguimiento).
 */
export function precisionSuficientePara(precisionMetros: number | null, radioMetros: number): boolean {
  if (precisionMetros === null) return false;
  return precisionMetros <= radioMetros;
}
