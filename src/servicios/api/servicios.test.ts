import { ServicioAuthApi } from '@/src/servicios/auth/servicioAuthApi';
import { ServicioEventosApi } from '@/src/servicios/eventos/servicioEventosApi';
import { ServicioFavoritosApi } from '@/src/servicios/favoritos/servicioFavoritosApi';
import { ServicioLugaresApi } from '@/src/servicios/lugares/servicioLugaresApi';
import { ServicioVisitasHttp, tipoMimeDeFoto } from '@/src/servicios/visitas/servicioVisitasHttp';
import { LUGARES_DE_PRUEBA } from '@/src/servicios/lugares/lugaresDePrueba';
import type { Visita } from '@/src/tipos/visita';
import { clienteDePrueba, fallo, ok } from './ayudasDePrueba';

const archivoSubido = (url: string) => ({ datos: { url, tipo: 'imagen' as const, bytes: 10 }, meta: null });
const errorDeArchivo = (codigo: string) => ({ error: { codigo, mensaje: 'mensaje' } });

const usuario = { id: 'usr-201', nombre: 'Lucía', email: 'lucia@mail.com' };

describe('ServicioAuthApi', () => {
  it('ingresa con la contraseña en el campo `contrasena`', async () => {
    const { cliente, pedidos } = clienteDePrueba(() => ok({ token: 'tok-9', usuario }));
    const r = await new ServicioAuthApi(cliente).iniciarSesion({ email: 'lucia@mail.com', password: 'lucia1234' });
    expect(r).toMatchObject({ datos: { token: 'tok-9' } });
    expect(pedidos[0].url).toBe('http://api.test:3000/auth/ingreso');
    expect(JSON.parse(pedidos[0].cuerpo!)).toEqual({ email: 'lucia@mail.com', contrasena: 'lucia1234' });
  });

  it('el registro manda nombre, email y contraseña, y devuelve el error de la API', async () => {
    const { cliente, pedidos } = clienteDePrueba(() => fallo(409, 'EMAIL_YA_REGISTRADO'));
    const r = await new ServicioAuthApi(cliente).registrar({ nombre: 'Ana', email: 'a@b.co', password: 'secreto1' });
    expect(r).toEqual({ error: expect.objectContaining({ codigo: 'EMAIL_YA_REGISTRADO' }) });
    expect(JSON.parse(pedidos[0].cuerpo!)).toEqual({ nombre: 'Ana', email: 'a@b.co', contrasena: 'secreto1' });
  });

  it('pide el usuario con el token que se le da', async () => {
    const { cliente, pedidos } = clienteDePrueba(() => ok(usuario), 'otro-token');
    await new ServicioAuthApi(cliente).obtenerUsuario('tok-explicito');
    expect(pedidos[0].encabezados.Authorization).toBe('Bearer tok-explicito');
  });

  it('cerrar sesión no llama a la API (no tiene ese endpoint)', async () => {
    const { cliente, pedidos } = clienteDePrueba(() => ok(null));
    expect(await new ServicioAuthApi(cliente).cerrarSesion()).toEqual({ datos: null, meta: null });
    expect(pedidos).toHaveLength(0);
  });
});

describe('ServicioFavoritosApi', () => {
  it('marca y desmarca por lugar', async () => {
    const { cliente, pedidos } = clienteDePrueba((p) =>
      p.metodo === 'DELETE' ? { estado: 204 } : ok({ id: 'fav-1', usuarioId: 'usr-201', lugarId: 'lug-004', creadoEn: 'x' })
    );
    const s = new ServicioFavoritosApi(cliente);
    expect(await s.agregar('usr-201', 'lug-004')).toMatchObject({ datos: { lugarId: 'lug-004' } });
    expect(await s.quitar('usr-201', 'lug-004')).toEqual({ datos: null, meta: null });
    expect(pedidos.map((p) => `${p.metodo} ${p.url}`)).toEqual([
      'PUT http://api.test:3000/yo/favoritos/lug-004',
      'DELETE http://api.test:3000/yo/favoritos/lug-004',
    ]);
  });
});

describe('ServicioLugaresApi', () => {
  it('trae el catálogo, descarta los dados de baja y suma la imagen de la tarjeta', async () => {
    const base = LUGARES_DE_PRUEBA[0];
    const lista = [
      { ...base, id: 'lug-a', imagenes: ['http://img/a.jpg'], activo: true },
      { ...base, id: 'lug-b', activo: false },
    ];
    const { cliente, pedidos } = clienteDePrueba(() => ok(lista, { total: 2, pagina: 1, porPagina: 500 }));
    const r = await new ServicioLugaresApi(cliente).listarLugares();
    expect(r.map((l) => l.id)).toEqual(['lug-a']);
    expect(r[0].imagenUrl).toBe('http://img/a.jpg');
    expect(new URL(pedidos[0].url).searchParams.get('porPagina')).toBe('500');
  });

  it('un lugar que no existe es null; otros errores suben', async () => {
    const noExiste = clienteDePrueba(() => fallo(404, 'LUGAR_NO_ENCONTRADO'));
    expect(await new ServicioLugaresApi(noExiste.cliente).obtenerPorId('lug-999')).toBeNull();
    const roto = clienteDePrueba(() => fallo(500, 'ERROR_INTERNO'));
    await expect(new ServicioLugaresApi(roto.cliente).obtenerPorId('lug-004')).rejects.toMatchObject({ codigo: 'ERROR_INTERNO' });
  });
});

describe('ServicioEventosApi', () => {
  it('pasa el rango como días (AAAA-MM-DD)', async () => {
    const { cliente, pedidos } = clienteDePrueba(() => ok([], { total: 0, pagina: 1, porPagina: 50 }));
    await new ServicioEventosApi(cliente).listarEventos({
      desde: '2026-11-14T00:00:00-03:00',
      hasta: '2026-11-21T00:00:00-03:00',
    });
    const q = new URL(pedidos[0].url).searchParams;
    expect(q.get('desde')).toBe('2026-11-14');
    expect(q.get('hasta')).toBe('2026-11-21');
  });
});

describe('ServicioVisitasHttp', () => {
  const visita: Visita = {
    id: 'vis-abc',
    usuarioId: 'usr-local-1',
    lugarId: 'lug-004',
    fechaHora: '2026-11-13T16:42:00-03:00',
    origen: 'qr',
    fotoUri: 'file:///data/visitas/vis-abc.jpg',
    nota: 'Hacía calor',
    sincronizada: false,
  };

  it('sube primero la foto y manda la visita con la URL que devolvió la API', async () => {
    const { cliente, pedidos } = clienteDePrueba(() => ok({ ...visita, fotoUri: 'http://api/archivos/x.jpg', sincronizada: true }));
    const subir = jest.fn(async (_uri: string) => archivoSubido('http://api/archivos/x.jpg'));
    const r = await new ServicioVisitasHttp(cliente, subir).subirVisita(visita);
    expect(subir).toHaveBeenCalledWith('file:///data/visitas/vis-abc.jpg');
    expect(JSON.parse(pedidos[0].cuerpo!)).toEqual({
      id: 'vis-abc',
      lugarId: 'lug-004',
      fechaHora: '2026-11-13T16:42:00-03:00',
      origen: 'qr',
      fotoUri: 'http://api/archivos/x.jpg',
      nota: 'Hacía calor',
    });
    expect(r).toMatchObject({ datos: { sincronizada: true } });
  });

  it('si la foto no se pudo subir, no manda la visita y devuelve el error', async () => {
    const { cliente, pedidos } = clienteDePrueba(() => ok(visita));
    const subir = jest.fn(async (_uri: string) => errorDeArchivo('TIPO_DE_ARCHIVO_NO_PERMITIDO'));
    const r = await new ServicioVisitasHttp(cliente, subir).subirVisita(visita);
    expect(r).toEqual({ error: expect.objectContaining({ codigo: 'TIPO_DE_ARCHIVO_NO_PERMITIDO' }) });
    expect(pedidos).toHaveLength(0);
  });

  it('una visita sin foto, o con una foto que ya es una URL, no sube nada', async () => {
    const { cliente } = clienteDePrueba(() => ok(visita));
    const subir = jest.fn();
    const s = new ServicioVisitasHttp(cliente, subir);
    await s.subirVisita({ ...visita, fotoUri: null });
    await s.subirVisita({ ...visita, fotoUri: 'https://api/archivos/y.jpg' });
    expect(subir).not.toHaveBeenCalled();
  });

  it('sin sesión queda pendiente (NO_AUTENTICADO) sin tocar la red', async () => {
    const { cliente, pedidos } = clienteDePrueba(() => ok(visita), null);
    const r = await new ServicioVisitasHttp(cliente, async () => archivoSubido('u')).subirVisita({
      ...visita,
      fotoUri: null,
    });
    expect(r).toEqual({ error: expect.objectContaining({ codigo: 'NO_AUTENTICADO' }) });
    expect(pedidos).toHaveLength(0);
  });

  it('deduce el tipo de la foto por la extensión', () => {
    expect(tipoMimeDeFoto('file:///a/b.PNG')).toBe('image/png');
    expect(tipoMimeDeFoto('file:///a/b.jpg?x=1')).toBe('image/jpeg');
    expect(tipoMimeDeFoto('file:///a/b')).toBe('image/jpeg');
  });
});
