import { ErrorDeServicio } from '@/src/tipos/api';
import { clienteDePrueba, fallo, ok } from './ayudasDePrueba';
import { construirUrl, interpretarRespuesta } from './cliente';

describe('construirUrl', () => {
  it('arma la dirección y omite los parámetros vacíos', () => {
    expect(construirUrl('http://x:3000/', '/lugares', { q: 'colon', categoriaId: undefined, pagina: 2, vacio: null })).toBe(
      'http://x:3000/lugares?q=colon&pagina=2'
    );
    expect(construirUrl('http://x:3000', 'salud')).toBe('http://x:3000/salud');
  });

  it('codifica lo que lo necesita', () => {
    expect(construirUrl('http://x', '/lugares', { q: 'a b&c' })).toBe('http://x/lugares?q=a+b%26c');
  });
});

describe('interpretarRespuesta', () => {
  it('éxito, error y borrado sin cuerpo', () => {
    expect(interpretarRespuesta(200, '{"datos":[1],"meta":{"total":1,"pagina":1,"porPagina":20}}')).toEqual({
      datos: [1],
      meta: { total: 1, pagina: 1, porPagina: 20 },
    });
    expect(interpretarRespuesta(404, '{"error":{"codigo":"LUGAR_NO_ENCONTRADO","mensaje":"No existe ese lugar."}}')).toEqual({
      error: { codigo: 'LUGAR_NO_ENCONTRADO', mensaje: 'No existe ese lugar.' },
    });
    expect(interpretarRespuesta(204, '')).toEqual({ datos: null, meta: null });
  });

  it('si el servidor contesta otra cosa (una página HTML de error) lanza, como una falla de red', () => {
    expect(() => interpretarRespuesta(502, '<html>Bad gateway</html>')).toThrow(ErrorDeServicio);
    expect(() => interpretarRespuesta(200, '{"algo":"raro"}')).toThrow(ErrorDeServicio);
  });
});

describe('cliente', () => {
  it('manda el token solo cuando el pedido pide sesión', async () => {
    const { cliente, pedidos } = clienteDePrueba(() => ok({ estado: 'ok' }));
    await cliente.pedir({ ruta: '/salud' });
    await cliente.pedir({ ruta: '/yo', conSesion: true });
    expect(pedidos[0].encabezados.Authorization).toBeUndefined();
    expect(pedidos[1].encabezados.Authorization).toBe('Bearer tok-1');
  });

  it('sin sesión devuelve NO_AUTENTICADO sin llamar a la red', async () => {
    const { cliente, pedidos } = clienteDePrueba(() => ok(null), null);
    const r = await cliente.pedir({ ruta: '/yo/favoritos', conSesion: true });
    expect(r).toEqual({ error: expect.objectContaining({ codigo: 'NO_AUTENTICADO' }) });
    expect(pedidos).toHaveLength(0);
  });

  it('manda el cuerpo como JSON', async () => {
    const { cliente, pedidos } = clienteDePrueba(() => ok({}));
    await cliente.pedir({ metodo: 'POST', ruta: '/auth/ingreso', cuerpo: { email: 'a@b.co', contrasena: 'x' } });
    expect(pedidos[0].metodo).toBe('POST');
    expect(pedidos[0].encabezados['Content-Type']).toBe('application/json');
    expect(JSON.parse(pedidos[0].cuerpo!)).toEqual({ email: 'a@b.co', contrasena: 'x' });
  });

  it('una falla de red lanza SIN_RED', async () => {
    const { cliente } = clienteDePrueba(() => new Error('Network request failed'));
    await expect(cliente.pedir({ ruta: '/salud' })).rejects.toMatchObject({ codigo: 'SIN_RED' });
  });

  it('pedirTodo junta todas las páginas', async () => {
    const { cliente, pedidos } = clienteDePrueba((p) => {
      const pagina = Number(new URL(p.url).searchParams.get('pagina'));
      const trozos = [[1, 2], [3, 4], [5]];
      return ok(trozos[pagina - 1] ?? [], { total: 5, pagina, porPagina: 2 });
    });
    const r = await cliente.pedirTodo<number>('/eventos', {}, { porPagina: 2 });
    expect(r).toEqual({ datos: [1, 2, 3, 4, 5], meta: { total: 5, pagina: 1, porPagina: 5 } });
    expect(pedidos).toHaveLength(3);
  });

  it('pedirTodo corta en el primer error', async () => {
    const { cliente, pedidos } = clienteDePrueba(() => fallo(500, 'ERROR_INTERNO'));
    const r = await cliente.pedirTodo('/eventos');
    expect(r).toEqual({ error: expect.objectContaining({ codigo: 'ERROR_INTERNO' }) });
    expect(pedidos).toHaveLength(1);
  });
});
