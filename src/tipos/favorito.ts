/** Tal cual el pedido de Valeria (página 11). No se toca cuando llegue la API. */
export interface Favorito {
  id: string;
  usuarioId: string;
  lugarId: string;
  /** ISO 8601 con zona. */
  creadoEn: string;
}
