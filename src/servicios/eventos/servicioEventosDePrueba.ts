import { crearEventosDePrueba } from '@/src/mocks/eventos';
import type { RespuestaApi } from '@/src/tipos/api';
import type { Evento } from '@/src/tipos/evento';
import { desdeISO } from '@/src/utils/fechas';
import type { FiltrosEventos, ServicioEventos } from './ServicioEventos';

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Mock de la API de eventos. Para enchufar la real, se reemplaza solo esta clase. */
export class ServicioEventosDePrueba implements ServicioEventos {
  constructor(
    private readonly fuente: () => Evento[] = () => crearEventosDePrueba(),
    private readonly demoraMs = 500
  ) {}

  async listarEventos(filtros?: FiltrosEventos): Promise<RespuestaApi<Evento[]>> {
    await esperar(this.demoraMs);
    const desde = desdeISO(filtros?.desde)?.getTime() ?? -Infinity;
    const hasta = desdeISO(filtros?.hasta)?.getTime() ?? Infinity;
    const datos = this.fuente()
      .filter((ev) => {
        const t = desdeISO(ev.inicio)?.getTime();
        return t !== undefined && t >= desde && t < hasta;
      })
      .sort((a, b) => a.inicio.localeCompare(b.inicio));
    return { datos, meta: { total: datos.length, pagina: 1, porPagina: datos.length } };
  }

  async obtenerEvento(id: string): Promise<RespuestaApi<Evento>> {
    await esperar(this.demoraMs / 2);
    const evento = this.fuente().find((ev) => ev.id === id);
    if (!evento) {
      return { error: { codigo: 'EVENTO_NO_ENCONTRADO', mensaje: 'No existe ese evento.' } };
    }
    return { datos: evento, meta: null };
  }
}
