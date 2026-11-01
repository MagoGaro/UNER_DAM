import type { Preferencias } from '@/src/tipos/preferencias';

/**
 * Valores por defecto: los usa quien no inició sesión y quien recién se
 * registra. Con cuenta, las preferencias vienen de `Usuario.preferencias`.
 */
export const PREFERENCIAS_POR_DEFECTO: Preferencias = {
  categoriasFavoritas: [],
  avisarProximidad: true,
  radioAvisoMetros: 250,
  tema: 'sistema',
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
