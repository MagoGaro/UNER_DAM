import type { RespuestaApi } from '@/src/tipos/api';

export type PlataformaDispositivo = 'ios' | 'android';

/** Registro del teléfono para recibir push del servidor (`/dispositivos`). */
export interface ServicioDispositivos {
  registrar(tokenExpo: string, plataforma: PlataformaDispositivo): Promise<RespuestaApi<unknown>>;
  quitar(tokenExpo: string): Promise<RespuestaApi<unknown>>;
}
