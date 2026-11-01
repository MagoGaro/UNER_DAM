import { crearKVStoreEnMemoria } from '@/src/almacenamiento/kvStore';
import { ServicioFavoritosDePrueba } from '@/src/servicios/favoritos/servicioFavoritosDePrueba';
import type { ServicioFavoritos } from '@/src/servicios/favoritos/ServicioFavoritos';
import { ErrorDeServicio } from '@/src/tipos/api';
import { AlmacenFavoritos, USUARIO_INVITADO } from './almacenFavoritos';

function armar(servicio: ServicioFavoritos = new ServicioFavoritosDePrueba(0)) {
  const kv = crearKVStoreEnMemoria();
  const nueva = () => new AlmacenFavoritos({ kv, servicio });
  return { kv, servicio, nueva, favoritos: nueva() };
}

/** Servicio que a veces no tiene señal. */
function conRedIntermitente() {
  const base = new ServicioFavoritosDePrueba(0);
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
    quitar: async (id) => {
      if (!estado.hayRed) throw new ErrorDeServicio('SIN_RED', 'sin red');
      return base.quitar(id);
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
    await favoritos.vincularUsuario('usr-201');

    const lugares = favoritos.obtener().favoritos.map((f) => f.lugarId).sort();
    expect(lugares).toEqual(['lug-004', 'lug-009']);
    expect(favoritos.obtener().favoritos.every((f) => f.usuarioId === 'usr-201')).toBe(true);

    const enServidor = await servicio.listar('usr-201');
    expect('datos' in enServidor && enServidor.datos.map((f) => f.lugarId).sort()).toEqual(['lug-004', 'lug-009']);
  });

  it('al cerrar sesión se borran del teléfono (siguen en la cuenta)', async () => {
    const { favoritos, servicio } = armar();
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
    await favoritos.vincularUsuario('usr-201'); // trae lug-004
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
