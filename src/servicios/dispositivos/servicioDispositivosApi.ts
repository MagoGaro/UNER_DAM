import type { ClienteApi } from '@/src/servicios/api/cliente';
import type { RespuestaApi } from '@/src/tipos/api';
import type { PlataformaDispositivo, ServicioDispositivos } from './ServicioDispositivos';

/**
 * `POST /dispositivos` y `DELETE /dispositivos/:tokenExpo`. Mientras la
 * API no tenga completa su parte de notificaciones responde 501
 * `NO_IMPLEMENTADO`: la app lo ignora y sigue.
 */
export class ServicioDispositivosApi implements ServicioDispositivos {
  constructor(private readonly cliente: ClienteApi) {}

  registrar(tokenExpo: string, plataforma: PlataformaDispositivo): Promise<RespuestaApi<unknown>> {
    return this.cliente.pedir({ metodo: 'POST', ruta: '/dispositivos', conSesion: true, cuerpo: { tokenExpo, plataforma } });
  }

  quitar(tokenExpo: string): Promise<RespuestaApi<unknown>> {
    return this.cliente.pedir({ metodo: 'DELETE', ruta: `/dispositivos/${encodeURIComponent(tokenExpo)}`, conSesion: true });
  }
}
