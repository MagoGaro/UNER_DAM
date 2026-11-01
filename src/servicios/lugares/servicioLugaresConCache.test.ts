import { crearKVStoreEnMemoria } from '@/src/almacenamiento/kvStore';
import { ErrorDeServicio } from '@/src/tipos/api';
import type { Lugar } from '@/src/tipos/lugar';
import { LUGARES_DE_PRUEBA } from './lugaresDePrueba';
import { ServicioLugaresConCache } from './servicioLugaresConCache';
import type { FiltrosLugares, ServicioLugares } from './ServicioLugares';

function servicioIntermitente() {
  const estado = { hayRed: true };
  const interno: ServicioLugares = {
    async listarLugares(_filtros?: FiltrosLugares) {
      if (!estado.hayRed) throw new ErrorDeServicio('SIN_RED', 'sin red');
      return LUGARES_DE_PRUEBA as readonly Lugar[];
    },
    async obtenerPorId(id) {
      if (!estado.hayRed) throw new ErrorDeServicio('SIN_RED', 'sin red');
      return LUGARES_DE_PRUEBA.find((l) => l.id === id) ?? null;
    },
  };
  return { estado, interno };
}

describe('ServicioLugaresConCache', () => {
  it('con señal devuelve lo del servicio', async () => {
    const { interno } = servicioIntermitente();
    const s = new ServicioLugaresConCache(interno, crearKVStoreEnMemoria());
    expect((await s.listarLugares()).length).toBeGreaterThan(0);
  });

  it('sin señal sigue mostrando lo último guardado, filtrado', async () => {
    const { estado, interno } = servicioIntermitente();
    const s = new ServicioLugaresConCache(interno, crearKVStoreEnMemoria());
    const completo = await s.listarLugares();
    estado.hayRed = false;

    expect(await s.listarLugares()).toHaveLength(completo.length);
    const primera = completo[0];
    const porCategoria = await s.listarLugares({ categoriaId: primera.categoriaId });
    expect(porCategoria.every((l) => l.categoriaId === primera.categoriaId)).toBe(true);
    const buscada = await s.listarLugares({ busqueda: primera.nombre.slice(0, 4) });
    expect(buscada.some((l) => l.id === primera.id)).toBe(true);
    expect((await s.obtenerPorId(primera.id))?.nombre).toBe(primera.nombre);
    expect(await s.obtenerPorId('no-existe')).toBeNull();
  });

  it('si nunca pudo traer el catálogo, el error llega a la pantalla', async () => {
    const { estado, interno } = servicioIntermitente();
    estado.hayRed = false;
    const s = new ServicioLugaresConCache(interno, crearKVStoreEnMemoria());
    await expect(s.listarLugares()).rejects.toBeInstanceOf(ErrorDeServicio);
    await expect(s.obtenerPorId('lug-004')).rejects.toBeInstanceOf(ErrorDeServicio);
  });

  it('una búsqueda con filtros no pisa el catálogo completo guardado', async () => {
    const { estado, interno } = servicioIntermitente();
    const s = new ServicioLugaresConCache(interno, crearKVStoreEnMemoria());
    await s.listarLugares();
    await s.listarLugares({ busqueda: 'zzz' });
    estado.hayRed = false;
    expect((await s.listarLugares()).length).toBe(LUGARES_DE_PRUEBA.filter((l) => l.activo).length);
  });
});
