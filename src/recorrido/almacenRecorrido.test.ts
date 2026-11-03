import { crearRepositorioEnMemoria } from '@/src/servicios/visitas/RepositorioVisitas';
import type { ServicioVisitasApi } from '@/src/servicios/visitas/ServicioVisitasApi';
import { crearRecorrido, LARGO_MAXIMO_NOTA } from './almacenRecorrido';

function armar(hayConexion: boolean) {
  const repo = crearRepositorioEnMemoria();
  const api: ServicioVisitasApi = {
    subirVisita: async (v) => ({ datos: { ...v, sincronizada: true }, meta: null }),
    eliminarVisita: async () => ({ datos: null, meta: null }),
  };
  let reloj = new Date(2026, 10, 13, 16, 42);
  const recorrido = crearRecorrido({
    repo,
    api,
    usuarioId: async () => 'usr-local-test',
    hayConexion: async () => hayConexion,
    guardarFoto: (uri, id) => `file:///docs/visitas/${id}.jpg`,
    borrarFoto: () => {},
    ahora: () => reloj,
  });
  return { recorrido, repo, avanzar: (min: number) => (reloj = new Date(reloj.getTime() + min * 60_000)) };
}

describe('recorrido', () => {
  it('sin señal la visita queda guardada en el teléfono como pendiente', async () => {
    const { recorrido, repo } = armar(false);
    const v = await recorrido.registrar({ lugarId: 'lug-004', origen: 'qr', fotoUri: 'file:///tmp/a.jpg', nota: '  Hacía 38 grados  ' });
    await recorrido.sincronizar();
    expect(v.sincronizada).toBe(false);
    expect(v.nota).toBe('Hacía 38 grados');
    expect(v.fotoUri).toContain('/visitas/');
    expect(v.fechaHora).toMatch(/^2026-11-13T16:42:00[+-]\d{2}:\d{2}$/);
    expect(await repo.pendientes()).toHaveLength(1);
  });

  it('con señal se sube y queda sincronizada', async () => {
    const { recorrido, repo } = armar(true);
    await recorrido.registrar({ lugarId: 'lug-004', origen: 'gps', fotoUri: null, nota: null });
    await recorrido.sincronizar();
    expect(await repo.pendientes()).toHaveLength(0);
    expect(recorrido.almacen.obtener().visitas[0].sincronizada).toBe(true);
  });

  it('el recorrido queda en orden cronológico', async () => {
    const { recorrido, avanzar } = armar(false);
    await recorrido.registrar({ lugarId: 'lug-001', origen: 'manual', fotoUri: null, nota: null });
    avanzar(30);
    await recorrido.registrar({ lugarId: 'lug-004', origen: 'qr', fotoUri: null, nota: null });
    expect(recorrido.almacen.obtener().visitas.map((v) => v.lugarId)).toEqual(['lug-001', 'lug-004']);
  });

  it('detecta si ya registró ese lugar hoy', async () => {
    const { recorrido } = armar(false);
    expect(recorrido.visitaDeHoy('lug-004')).toBeNull();
    await recorrido.registrar({ lugarId: 'lug-004', origen: 'qr', fotoUri: null, nota: null });
    expect(recorrido.visitaDeHoy('lug-004')).not.toBeNull();
  });

  it('editar la nota la recorta y vuelve a dejarla pendiente', async () => {
    const { recorrido } = armar(true);
    const v = await recorrido.registrar({ lugarId: 'lug-004', origen: 'qr', fotoUri: null, nota: null });
    await recorrido.sincronizar();
    await recorrido.editar(v.id, { nota: 'x'.repeat(1000) });
    const editada = recorrido.almacen.obtener().visitas[0];
    expect(editada.nota).toHaveLength(LARGO_MAXIMO_NOTA);
  });

  it('eliminar la saca del recorrido', async () => {
    const { recorrido, repo } = armar(false);
    const v = await recorrido.registrar({ lugarId: 'lug-004', origen: 'qr', fotoUri: null, nota: null });
    await recorrido.eliminar(v.id);
    expect(recorrido.almacen.obtener().visitas).toHaveLength(0);
    expect(await repo.listar()).toHaveLength(0);
  });
});

describe('recorrido en un teléfono nuevo', () => {
  const remota = (id: string, fechaHora: string) => ({
    id,
    usuarioId: 'usr-201',
    lugarId: 'lug-004',
    fechaHora,
    origen: 'qr' as const,
    fotoUri: 'http://api/archivos/x.jpg',
    nota: 'Desde otro teléfono',
    sincronizada: true,
  });

  function armarConServidor(remotas: ReturnType<typeof remota>[], hayConexion = true) {
    const repo = crearRepositorioEnMemoria();
    const api: ServicioVisitasApi = {
      subirVisita: async (v) => ({ datos: { ...v, sincronizada: true }, meta: null }),
      eliminarVisita: async () => ({ datos: null, meta: null }),
      listarVisitas: async () => ({ datos: remotas, meta: null }),
    };
    const recorrido = crearRecorrido({
      repo,
      api,
      usuarioId: async () => 'usr-201',
      hayConexion: async () => hayConexion,
      guardarFoto: (_u, id) => `file:///docs/visitas/${id}.jpg`,
      borrarFoto: () => {},
      ahora: () => new Date(2026, 10, 13, 16, 42),
    });
    return { recorrido, repo };
  }

  it('al sincronizar trae las visitas de la cuenta que no estaban y las muestra en orden', async () => {
    const { recorrido, repo } = armarConServidor([
      remota('vis-2', '2026-11-12T11:00:00-03:00'),
      remota('vis-1', '2026-11-11T10:00:00-03:00'),
    ]);
    await recorrido.recargar();
    await recorrido.sincronizar();
    expect(recorrido.almacen.obtener().visitas.map((v) => v.id)).toEqual(['vis-1', 'vis-2']);
    expect(await repo.pendientes()).toHaveLength(0);
  });

  it('no duplica una visita que ya estaba en el teléfono', async () => {
    const { recorrido, repo } = armarConServidor([remota('vis-1', '2026-11-11T10:00:00-03:00')]);
    await repo.guardar({ ...remota('vis-1', '2026-11-11T10:00:00-03:00'), nota: 'Nota local' });
    await recorrido.recargar();
    await recorrido.sincronizar();
    const visitas = recorrido.almacen.obtener().visitas;
    expect(visitas).toHaveLength(1);
    expect(visitas[0].nota).toBe('Nota local');
  });

  it('sin señal no intenta traer nada', async () => {
    const { recorrido } = armarConServidor([remota('vis-1', '2026-11-11T10:00:00-03:00')], false);
    await recorrido.recargar();
    await recorrido.sincronizar();
    expect(recorrido.almacen.obtener().visitas).toHaveLength(0);
  });
});
