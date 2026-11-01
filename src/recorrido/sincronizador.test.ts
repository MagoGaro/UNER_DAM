import { crearRepositorioEnMemoria } from '@/src/servicios/visitas/RepositorioVisitas';
import type { ServicioVisitasApi } from '@/src/servicios/visitas/ServicioVisitasApi';
import type { Visita } from '@/src/tipos/visita';
import { sincronizarPendientes } from './sincronizador';

const visita = (id: string, extra: Partial<Visita> = {}): Visita => ({
  id,
  usuarioId: 'usr-local-1',
  lugarId: 'lug-004',
  fechaHora: `2026-11-13T16:4${id.slice(-1)}:00-03:00`,
  origen: 'qr',
  fotoUri: null,
  nota: null,
  sincronizada: false,
  ...extra,
});

const apiOk: ServicioVisitasApi = {
  subirVisita: async (v) => ({ datos: { ...v, sincronizada: true }, meta: null }),
  eliminarVisita: async () => ({ datos: null, meta: null }),
};

describe('sincronizarPendientes', () => {
  it('sin conexión no toca nada', async () => {
    const repo = crearRepositorioEnMemoria([visita('vis-1')]);
    const r = await sincronizarPendientes(repo, apiOk, false);
    expect(r.sinConexion).toBe(true);
    expect(await repo.pendientes()).toHaveLength(1);
  });

  it('con conexión sube todas las pendientes y deja las ya subidas', async () => {
    const repo = crearRepositorioEnMemoria([visita('vis-1'), visita('vis-2'), visita('vis-3', { sincronizada: true })]);
    const r = await sincronizarPendientes(repo, apiOk, true);
    expect(r).toEqual({ subidas: 2, fallidas: 0, sinConexion: false });
    expect(await repo.pendientes()).toHaveLength(0);
  });

  it('si se cae la red a mitad de camino, lo que no subió queda pendiente', async () => {
    let llamadas = 0;
    const apiQueSeCae: ServicioVisitasApi = {
      ...apiOk,
      subirVisita: async (v) => {
        llamadas += 1;
        if (llamadas === 2) throw new Error('Network request failed');
        return { datos: { ...v, sincronizada: true }, meta: null };
      },
    };
    const repo = crearRepositorioEnMemoria([visita('vis-1'), visita('vis-2'), visita('vis-3')]);
    const r = await sincronizarPendientes(repo, apiQueSeCae, true);
    expect(r.subidas).toBe(1);
    expect((await repo.pendientes()).map((v) => v.id)).toEqual(['vis-2', 'vis-3']);
  });

  it('un error de datos de la API no frena al resto', async () => {
    const apiConError: ServicioVisitasApi = {
      ...apiOk,
      subirVisita: async (v) =>
        v.id === 'vis-1'
          ? { error: { codigo: 'LUGAR_NO_ENCONTRADO', mensaje: 'No existe ese lugar.' } }
          : { datos: { ...v, sincronizada: true }, meta: null },
    };
    const repo = crearRepositorioEnMemoria([visita('vis-1'), visita('vis-2')]);
    const r = await sincronizarPendientes(repo, apiConError, true);
    expect(r).toEqual({ subidas: 1, fallidas: 1, sinConexion: false });
  });
});
