import { crearKVStoreEnMemoria } from '@/src/almacenamiento/kvStore';
import type { ServicioFavoritos } from '@/src/servicios/favoritos/ServicioFavoritos';
import { ErrorDeServicio } from '@/src/tipos/api';
import type { Favorito } from '@/src/tipos/favorito';
import { AlmacenFavoritos, USUARIO_INVITADO } from './almacenFavoritos';

class FavoritosEnMemoria implements ServicioFavoritos {
  private readonly datos = new Map<string, Favorito>();
  private n = 100;

  async listar(usuarioId: string) {
    const lista = [...this.datos.values()].filter((f) => f.usuarioId === usuarioId);
    return { datos: lista, meta: { total: lista.length, pagina: 1, porPagina: Math.max(lista.length, 1) } };
  }

  async agregar(usuarioId: string, lugarId: string) {
    const existente = [...this.datos.values()].find((f) => f.usuarioId === usuarioId && f.lugarId === lugarId);
    if (existente) return { datos: existente, meta: null as null };
    this.n += 1;
    const nuevo: Favorito = {
      id: `fav-${this.n}`,
      usuarioId,
      lugarId,
      creadoEn: '2026-11-04T10:00:00-03:00',
    };
    this.datos.set(nuevo.id, nuevo);
    return { datos: nuevo, meta: null as null };
  }

  async quitar(usuarioId: string, lugarId: string) {
    for (const [id, f] of this.datos) {
      if (f.usuarioId === usuarioId && f.lugarId === lugarId) this.datos.delete(id);
    }
    return { datos: null, meta: null as null };
  }
}

function armar(servicio: ServicioFavoritos = new FavoritosEnMemoria()) {
  const kv = crearKVStoreEnMemoria();
  const nueva = () => new AlmacenFavoritos({ kv, servicio });
  return { kv, servicio, nueva, favoritos: nueva() };
}

/** Servicio que a veces no tiene señal. */
function conRedIntermitente() {
  const base = new FavoritosEnMemoria();
  const estado = { hayRed: true };
  const servicio: ServicioFavoritos = {
    listar: async (u) => {
      if (!estado.hayRed) throw new ErrorDeServicio('SIN_RED', 'sin red');
      return base.listar(u);
    },
    agregar: async (u, l) => {
      if (!estado.hayRed) throw new ErrorDeServicio('SIN_RED', 'sin red');
      return base.agregar(u, l);
    },
    quitar: async (u, l) => {
      if (!estado.hayRed) throw new ErrorDeServicio('SIN_RED', 'sin red');
      return base.quitar(u, l);
    },
  };
  return { estado, servicio, base };
}

describe('AlmacenFavoritos', () => {
  it('sin cuenta marca y desmarca con un toque, y lo recuerda al reabrir', async () => {
    const { favoritos, nueva } = armar();
    expect(await favoritos.alternar('lug-001')).toBe(true);
    expect(favoritos.esFavorito('lug-001')).toBe(true);
    expect(favoritos.obtener().favoritos[0].usuarioId).toBe(USUARIO_INVITADO);

    const reabierto = nueva();
    await reabierto.cargar();
    expect(reabierto.esFavorito('lug-001')).toBe(true);

    expect(await reabierto.alternar('lug-001')).toBe(false);
    expect(reabierto.esFavorito('lug-001')).toBe(false);
  });

  it('al ingresar, los favoritos del invitado pasan a la cuenta y se suman a los que ya tenía', async () => {
    const { favoritos, servicio } = armar();
    await favoritos.alternar('lug-009');
    await servicio.agregar('usr-201', 'lug-004');
    await favoritos.vincularUsuario('usr-201');

    const lugares = favoritos.obtener().favoritos.map((f) => f.lugarId).sort();
    expect(lugares).toEqual(['lug-004', 'lug-009']);
    expect(favoritos.obtener().favoritos.every((f) => f.usuarioId === 'usr-201')).toBe(true);

    const enServidor = await servicio.listar('usr-201');
    expect('datos' in enServidor && enServidor.datos.map((f) => f.lugarId).sort()).toEqual(['lug-004', 'lug-009']);
  });

  it('al cerrar sesión se borran del teléfono (siguen en la cuenta)', async () => {
    const { favoritos, servicio } = armar();
    await servicio.agregar('usr-201', 'lug-004');
    await favoritos.vincularUsuario('usr-201');
    expect(favoritos.esFavorito('lug-004')).toBe(true);
    await favoritos.vincularUsuario(null);
    expect(favoritos.obtener().favoritos).toEqual([]);
    const enServidor = await servicio.listar('usr-201');
    expect('datos' in enServidor && enServidor.datos).toHaveLength(1);
  });

  it('sin señal guarda igual y lo sube cuando vuelve la conexión', async () => {
    const { estado, servicio, base } = conRedIntermitente();
    const { favoritos } = armar(servicio);
    await favoritos.vincularUsuario('usr-300');
    estado.hayRed = false;
    expect(await favoritos.alternar('lug-007')).toBe(true);
    expect(favoritos.esFavorito('lug-007')).toBe(true);
    let remoto = await base.listar('usr-300');
    expect('datos' in remoto && remoto.datos).toHaveLength(0);

    estado.hayRed = true;
    await favoritos.sincronizar();
    remoto = await base.listar('usr-300');
    expect('datos' in remoto && remoto.datos.map((f) => f.lugarId)).toEqual(['lug-007']);
    expect(favoritos.esFavorito('lug-007')).toBe(true);
  });

  it('un favorito quitado sin señal no reaparece al sincronizar', async () => {
    const { estado, servicio } = conRedIntermitente();
    const { favoritos } = armar(servicio);
    await servicio.agregar('usr-201', 'lug-004');
    await favoritos.vincularUsuario('usr-201');
    estado.hayRed = false;
    await favoritos.alternar('lug-004');
    expect(favoritos.esFavorito('lug-004')).toBe(false);
    estado.hayRed = true;
    await favoritos.sincronizar();
    expect(favoritos.esFavorito('lug-004')).toBe(false);
  });

  it('si cambia la cuenta no se mezclan los favoritos de una con la otra', async () => {
    const { favoritos } = armar();
    await favoritos.vincularUsuario('usr-201');
    await favoritos.vincularUsuario('usr-999');
    expect(favoritos.obtener().favoritos).toEqual([]);
  });
});
