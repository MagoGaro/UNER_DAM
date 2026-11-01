import type { Preferencias } from './preferencias';

/** Tal cual el pedido de Valeria (página 10). No se toca cuando llegue la API. */
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  avatarUrl: string | null;
  /** ISO 8601 con zona. */
  creadoEn: string;
  preferencias: Preferencias;
}
