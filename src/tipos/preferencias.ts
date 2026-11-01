/** Radios de aviso admitidos (sección 3, tarea 7 del seguimiento). */
export const RADIOS_AVISO_METROS = [100, 250, 500] as const;
export type RadioAvisoMetros = (typeof RADIOS_AVISO_METROS)[number];

export type TemaApp = 'claro' | 'oscuro' | 'sistema';

/** Tal cual el pedido de Valeria (página 10). */
export interface Preferencias {
  categoriasFavoritas: string[];
  avisarProximidad: boolean;
  radioAvisoMetros: RadioAvisoMetros;
  tema: TemaApp;
}
