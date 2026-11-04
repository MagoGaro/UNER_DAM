/**
 * Forma fija de las respuestas de la API de la cátedra: `{ datos, meta }`
 * o `{ error: { codigo, mensaje } }`.
 */
export interface MetaPaginacion {
  total: number;
  pagina: number;
  porPagina: number;
}

export interface RespuestaExito<T> {
  datos: T;
  meta: MetaPaginacion | null;
}

export interface ErrorApi {
  codigo: string;
  mensaje: string;
}

export interface RespuestaError {
  error: ErrorApi;
}

export type RespuestaApi<T> = RespuestaExito<T> | RespuestaError;

export function esError<T>(respuesta: RespuestaApi<T>): respuesta is RespuestaError {
  return (respuesta as RespuestaError).error !== undefined;
}

/** Error de red/servidor tipado, para que la UI distinga "sin señal" de "no existe". */
export class ErrorDeServicio extends Error {
  constructor(
    readonly codigo: string,
    mensaje: string
  ) {
    super(mensaje);
    this.name = 'ErrorDeServicio';
  }
}
