import type { RespuestaApi } from '@/src/tipos/api';
import type { Visita } from '@/src/tipos/visita';
import type { ServicioVisitasApi } from './ServicioVisitasApi';

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Mock: "sube" la visita con una demora, como haría la API real. */
export class ServicioVisitasDePrueba implements ServicioVisitasApi {
  constructor(private readonly demoraMs = 700) {}

  async subirVisita(visita: Visita): Promise<RespuestaApi<Visita>> {
    await esperar(this.demoraMs);
    if (!visita.lugarId) {
      return { error: { codigo: 'LUGAR_NO_ENCONTRADO', mensaje: 'No existe ese lugar.' } };
    }
    return { datos: { ...visita, sincronizada: true }, meta: null };
  }

  async eliminarVisita(): Promise<RespuestaApi<null>> {
    await esperar(this.demoraMs / 2);
    return { datos: null, meta: null };
  }
}
