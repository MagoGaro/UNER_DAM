import type { ClienteApi } from '@/src/servicios/api/cliente';
import type { RespuestaApi } from '@/src/tipos/api';
import type { Evento } from '@/src/tipos/evento';
import type { ServicioEventosGuardados } from './ServicioEventosGuardados';

/** `GET`, `PUT` y `DELETE /yo/eventos-guardados`. Piden sesión. */
export class ServicioEventosGuardadosApi implements ServicioEventosGuardados {
  constructor(private readonly cliente: ClienteApi) {}

  listar(): Promise<RespuestaApi<Evento[]>> {
    return this.cliente.pedirTodo<Evento>('/yo/eventos-guardados', {}, { conSesion: true });
  }

  guardar(eventoId: string): Promise<RespuestaApi<Evento>> {
    return this.cliente.pedir<Evento>({
      metodo: 'PUT',
      ruta: `/yo/eventos-guardados/${encodeURIComponent(eventoId)}`,
      conSesion: true,
    });
  }

  quitar(eventoId: string): Promise<RespuestaApi<null>> {
    return this.cliente.pedir<null>({
      metodo: 'DELETE',
      ruta: `/yo/eventos-guardados/${encodeURIComponent(eventoId)}`,
      conSesion: true,
    });
  }
}
