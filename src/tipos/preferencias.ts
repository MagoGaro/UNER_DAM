/** Radios de aviso admitidos (sección 3, tarea 7 del seguimiento). */
export const RADIOS_AVISO_METROS = [100, 250, 500] as const;
export type RadioAvisoMetros = (typeof RADIOS_AVISO_METROS)[number];

/**
 * Preferencias del usuario relevantes para esta parte. El resto de
 * Preferencias (idioma, favoritos, etc.) lo define el Integrante 3 junto
 * con Cuenta y Favoritos; mientras no exista, se usan los valores por
 * defecto de `./preferenciasPorDefecto`.
 */
export interface Preferencias {
  avisarProximidad: boolean;
  radioAvisoMetros: RadioAvisoMetros;
}
