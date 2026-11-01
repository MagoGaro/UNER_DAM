/** Tipos tal cual el pedido de Valeria (página 12). No se tocan cuando llegue la API. */
export type OrigenVisita = 'qr' | 'gps' | 'manual';

export interface Visita {
  id: string;
  usuarioId: string;
  lugarId: string;
  /** ISO 8601 con zona. */
  fechaHora: string;
  origen: OrigenVisita;
  /** Ruta local (file://) hasta que se sube. */
  fotoUri: string | null;
  nota: string | null;
  /** false mientras la visita espera en la cola local para subirse. */
  sincronizada: boolean;
}
