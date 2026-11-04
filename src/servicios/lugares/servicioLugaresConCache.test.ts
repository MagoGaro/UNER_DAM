import { crearKVStoreEnMemoria } from '@/src/almacenamiento/kvStore';
import { ErrorDeServicio } from '@/src/tipos/api';
import type { Lugar } from '@/src/tipos/lugar';
import { ServicioLugaresConCache } from './servicioLugaresConCache';
import type { FiltrosLugares, ServicioLugares } from './ServicioLugares';

function lugar(parcial: Pick<Lugar, 'id' | 'nombre' | 'categoriaId'> & Partial<Lugar>): Lugar {
  return {
    descripcionCorta: 'corto',
    descripcion: 'largo',
    coordenadas: { latitud: -32.22, longitud: -58.14 },
    direccion: 'Colón',
    imagenes: [],
    horarios: [],
    telefono: null,
    sitioWeb: null,
    precioEntrada: null,
    audioguia: null,
    codigoQr: null,
    accesible: true,
    actualizadoEn: '2026-08-01T10:30:00-03:00',
    activo: true,
    ...parcial,
  };
}

const CATALOGO: Lugar[] = [
  lugar({ id: 'lug-004', nombre: 'Molino Forclaz', categoriaId: 'cat-museos' }),
  lugar({ id: 'lug-001', nombre: 'Termas de Colón', categoriaId: 'cat-termas' }),
];

function servicioIntermitente() {
  const estado = { hayRed: true };
  const interno: ServicioLugares = {
    async listarLugares(_filtros?: FiltrosLugares) {
      if (!estado.hayRed) throw new ErrorDeServicio('SIN_RED', 'sin red');
      return CATALOGO;
    },
    async obtenerPorId(id) {
      if (!estado.hayRed) throw new ErrorDeServicio('SIN_RED', 'sin red');
      return CATALOGO.find((l) => l.id === id) ?? null;
    },
    async obtenerPorQr() {
      return null;
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
    expect((await s.listarLugares()).length).toBe(CATALOGO.filter((l) => l.activo).length);
  });
});
