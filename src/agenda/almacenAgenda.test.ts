import { crearKVStoreEnMemoria } from '@/src/almacenamiento/kvStore';
import type { ServicioRecordatorios } from '@/src/notificaciones/recordatoriosEventos';
import { ServicioEventosDePrueba } from '@/src/servicios/eventos/servicioEventosDePrueba';
import type { Evento } from '@/src/tipos/evento';
import { aISOConZona } from '@/src/utils/fechas';
import { crearAgenda } from './almacenAgenda';

jest.mock('@/src/notificaciones/recordatoriosEventos', () => ({ servicioRecordatoriosExpo: {} }));
jest.mock('@/src/servicios/eventos', () => ({ servicioEventos: {} }));

const ahora = new Date(2026, 9, 22, 9, 0);
const enHoras = (h: number) => aISOConZona(new Date(ahora.getTime() + h * 3_600_000));

function evento(extra: Partial<Evento> = {}): Evento {
  return {
    id: 'evt-1',
    titulo: 'Peña',
    descripcion: '',
    lugarId: null,
    direccionLibre: 'Costanera',
    coordenadas: null,
    inicio: enHoras(5),
    fin: enHoras(8),
    imagenUrl: null,
    precio: 0,
    estado: 'programado',
    ...extra,
  };
}

function recordatoriosFalsos() {
  const registro = { programados: [] as string[], cancelados: [] as (string | null)[], avisos: [] as string[] };
  let n = 0;
  const servicio: ServicioRecordatorios = {
    async programar(ev) {
      registro.programados.push(ev.id);
      n += 1;
      return `notif-${n}`;
    },
    async cancelar(id) {
      registro.cancelados.push(id);
    },
    async avisarAhora(titulo) {
      registro.avisos.push(titulo);
    },
  };
  return { servicio, registro };
}

describe('almacenAgenda', () => {
  it('guardar programa el recordatorio y quitar lo cancela', async () => {
    const { servicio, registro } = recordatoriosFalsos();
    let datos = [evento()];
    const agenda = crearAgenda({
      servicio: new ServicioEventosDePrueba(() => datos, 0),
      store: crearKVStoreEnMemoria(),
      recordatorios: servicio,
      ahora: () => ahora,
    });
    await agenda.cargarEventos();
    const r = await agenda.alternarGuardado(datos[0]);
    expect(r.guardado).toBe(true);
    expect(r.recordatorio).not.toBeNull();
    expect(registro.programados).toEqual(['evt-1']);
    expect(agenda.estaGuardado('evt-1')).toBe(true);

    const r2 = await agenda.alternarGuardado(datos[0]);
    expect(r2.guardado).toBe(false);
    expect(registro.cancelados).toEqual(['notif-1']);
  });

  it('si un evento guardado se suspende, cancela el recordatorio y avisa', async () => {
    const { servicio, registro } = recordatoriosFalsos();
    let datos = [evento()];
    const agenda = crearAgenda({
      servicio: new ServicioEventosDePrueba(() => datos, 0),
      store: crearKVStoreEnMemoria(),
      recordatorios: servicio,
      ahora: () => ahora,
    });
    await agenda.cargarEventos();
    await agenda.alternarGuardado(datos[0]);

    datos = [evento({ estado: 'suspendido' })];
    await agenda.cargarEventos();

    expect(registro.cancelados).toContain('notif-1');
    expect(registro.avisos).toEqual(['Evento suspendido']);
    expect(agenda.almacen.obtener().guardados['evt-1'].estadoConocido).toBe('suspendido');

    // una segunda actualización no vuelve a avisar lo mismo
    await agenda.cargarEventos();
    expect(registro.avisos).toHaveLength(1);
  });

  it('sin señal usa la copia guardada en el teléfono', async () => {
    const { servicio } = recordatoriosFalsos();
    const store = crearKVStoreEnMemoria();
    const conRed = crearAgenda({
      servicio: new ServicioEventosDePrueba(() => [evento()], 0),
      store,
      recordatorios: servicio,
      ahora: () => ahora,
    });
    await conRed.cargarEventos();

    const sinRed = crearAgenda({
      servicio: { listarEventos: () => Promise.reject(new Error('sin red')), obtenerEvento: () => Promise.reject(new Error('sin red')) },
      store,
      recordatorios: servicio,
      ahora: () => ahora,
    });
    await sinRed.cargarEventos();
    const estado = sinRed.almacen.obtener();
    expect(estado.estado).toBe('listo');
    expect(estado.desdeCache).toBe(true);
    expect(estado.eventos).toHaveLength(1);
  });

  it('sin señal y sin copia muestra error (no se queda colgada)', async () => {
    const { servicio } = recordatoriosFalsos();
    const agenda = crearAgenda({
      servicio: { listarEventos: () => Promise.reject(new Error('sin red')), obtenerEvento: () => Promise.reject(new Error('sin red')) },
      store: crearKVStoreEnMemoria(),
      recordatorios: servicio,
      ahora: () => ahora,
    });
    await agenda.cargarEventos();
    expect(agenda.almacen.obtener().estado).toBe('error');
  });

  it('guardar un evento cancelado no programa recordatorio', async () => {
    const { servicio, registro } = recordatoriosFalsos();
    const agenda = crearAgenda({
      servicio: new ServicioEventosDePrueba(() => [], 0),
      store: crearKVStoreEnMemoria(),
      recordatorios: servicio,
      ahora: () => ahora,
    });
    const r = await agenda.alternarGuardado(evento({ estado: 'cancelado' }));
    expect(r.recordatorio).toBeNull();
    expect(registro.programados).toEqual([]);
  });
});
