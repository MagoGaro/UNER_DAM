import { crearKVStoreEnMemoria } from '@/src/almacenamiento/kvStore';
import type { ServicioRecordatorios } from '@/src/notificaciones/recordatoriosEventos';
import { ServicioEventosDePrueba } from '@/src/servicios/eventos/servicioEventosDePrueba';
import type { Evento } from '@/src/tipos/evento';
import { aISOConZona } from '@/src/utils/fechas';
import type { ServicioEventosGuardados } from '@/src/servicios/eventosGuardados';
import { crearAgenda } from './almacenAgenda';

jest.mock('@/src/notificaciones/recordatoriosEventos', () => ({ servicioRecordatoriosExpo: {} }));
jest.mock('@/src/servicios/eventos', () => ({ servicioEventos: {} }));
jest.mock('@/src/servicios/eventosGuardados', () => ({ servicioEventosGuardados: {} }));

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

describe('eventos guardados en la cuenta', () => {
  function servidorFalso(enServidor: Evento[] = []) {
    const registro = { guardados: [] as string[], quitados: [] as string[] };
    const estado = { sesion: true };
    const servicio: ServicioEventosGuardados = {
      async listar() {
        return estado.sesion
          ? { datos: enServidor, meta: null }
          : { error: { codigo: 'NO_AUTENTICADO', mensaje: 'Tenés que ingresar.' } };
      },
      async guardar(id) {
        registro.guardados.push(id);
        return { datos: null, meta: null };
      },
      async quitar(id) {
        registro.quitados.push(id);
        return { datos: null, meta: null };
      },
    };
    return { servicio, registro, estado };
  }

  function armar(servidor: ServicioEventosGuardados, datos: Evento[]) {
    const { servicio } = recordatoriosFalsos();
    return crearAgenda({
      servicio: new ServicioEventosDePrueba(() => datos, 0),
      store: crearKVStoreEnMemoria(),
      recordatorios: servicio,
      ahora: () => ahora,
      guardadosServidor: servidor,
    });
  }

  it('al guardar y al quitar avisa a la cuenta', async () => {
    const { servicio, registro } = servidorFalso();
    const datos = [evento()];
    const agenda = armar(servicio, datos);
    await agenda.cargarEventos();
    await agenda.alternarGuardado(datos[0]);
    await agenda.alternarGuardado(datos[0]);
    expect(registro.guardados).toEqual(['evt-1']);
    expect(registro.quitados).toEqual(['evt-1']);
  });

  it('al sincronizar sube lo que solo estaba en el teléfono', async () => {
    const { servicio, registro } = servidorFalso([]);
    const datos = [evento()];
    const agenda = armar(servicio, datos);
    await agenda.cargarEventos();
    await agenda.alternarGuardado(datos[0]);
    registro.guardados.length = 0;
    await agenda.sincronizarGuardados();
    expect(registro.guardados).toEqual(['evt-1']);
  });

  it('en un teléfono nuevo trae los eventos que la cuenta tenía guardados', async () => {
    const delServidor = evento({ id: 'evt-9', titulo: 'Feria' });
    const { servicio, registro } = servidorFalso([delServidor]);
    const agenda = armar(servicio, [delServidor]);
    await agenda.sincronizarGuardados();
    expect(agenda.estaGuardado('evt-9')).toBe(true);
    expect(registro.guardados).toEqual([]);
  });

  it('sin sesión no cambia nada', async () => {
    const { servicio, estado } = servidorFalso([evento({ id: 'evt-9' })]);
    estado.sesion = false;
    const agenda = armar(servicio, []);
    await agenda.sincronizarGuardados();
    expect(agenda.estaGuardado('evt-9')).toBe(false);
  });
});
