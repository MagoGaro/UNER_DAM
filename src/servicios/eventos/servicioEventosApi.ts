import type { ClienteApi } from '@/src/servicios/api/cliente';
import type { RespuestaApi } from '@/src/tipos/api';
import type { Evento } from '@/src/tipos/evento';
import type { FiltrosEventos, ServicioEventos } from './ServicioEventos';

/** La API filtra por día (`AAAA-MM-DD`): se toma el día de la fecha ISO tal cual viene, sin convertir de zona. */
const diaDe = (iso?: string): string | undefined => (iso ? iso.slice(0, 10) : undefined);

/** Agenda contra la API real (`GET /eventos` y `GET /eventos/:id`). */
export class ServicioEventosApi implements ServicioEventos {
  constructor(private readonly cliente: ClienteApi) {}

  listarEventos(filtros?: FiltrosEventos): Promise<RespuestaApi<Evento[]>> {
    return this.cliente.pedirTodo<Evento>('/eventos', {
      desde: diaDe(filtros?.desde),
      hasta: diaDe(filtros?.hasta),
    });
  }

  obtenerEvento(id: string): Promise<RespuestaApi<Evento>> {
    return this.cliente.pedir<Evento>({ ruta: `/eventos/${encodeURIComponent(id)}` });
  }
}
