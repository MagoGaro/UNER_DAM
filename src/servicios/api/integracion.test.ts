/**
 * Prueba contra la API REAL. No corre por defecto: solo si se le da la
 * dirección de una API levantada (carpeta api-mi-ciudad del repo de la
 * cátedra, con sus datos de demo).
 *
 *   API_PRUEBAS_URL=http://localhost:3000 npx jest src/servicios/api/integracion
 */
import { ServicioAuthApi } from '@/src/servicios/auth/servicioAuthApi';
import { ServicioEventosApi } from '@/src/servicios/eventos/servicioEventosApi';
import { ServicioFavoritosApi } from '@/src/servicios/favoritos/servicioFavoritosApi';
import { ServicioLugaresApi } from '@/src/servicios/lugares/servicioLugaresApi';
import { esError } from '@/src/tipos/api';
import { crearCliente } from './cliente';

const URL_PRUEBAS = process.env.API_PRUEBAS_URL;
const describirSiHayApi = URL_PRUEBAS ? describe : describe.skip;

describirSiHayApi('API real de Mi Ciudad', () => {
  let token: string | null = null;
  const cliente = crearCliente({ urlBase: URL_PRUEBAS ?? '', leerToken: async () => token });

  it('/salud responde ok', async () => {
    const r = await cliente.pedir<{ estado: string }>({ ruta: '/salud' });
    expect(r).toMatchObject({ datos: { estado: 'ok' } });
  });

  it('el catálogo trae lugares con todos sus campos', async () => {
    const lugares = await new ServicioLugaresApi(cliente).listarLugares();
    expect(lugares.length).toBeGreaterThan(0);
    const l = lugares[0];
    expect(typeof l.id).toBe('string');
    expect(typeof l.coordenadas.latitud).toBe('number');
    expect(l).toHaveProperty('telefono');
    expect(Array.isArray(l.horarios)).toBe(true);
  });

  it('un lugar que no existe es null', async () => {
    expect(await new ServicioLugaresApi(cliente).obtenerPorId('lug-no-existe')).toBeNull();
  });

  it('la agenda trae eventos', async () => {
    const r = await new ServicioEventosApi(cliente).listarEventos({
      desde: '2026-01-01T00:00:00-03:00',
      hasta: '2027-12-31T00:00:00-03:00',
    });
    expect(esError(r)).toBe(false);
  });

  it('ingresa con la usuaria de demo y marca y desmarca un favorito', async () => {
    const auth = new ServicioAuthApi(cliente);
    const sesion = await auth.iniciarSesion({ email: 'lucia@mail.com', password: 'lucia1234' });
    if (esError(sesion)) throw new Error(sesion.error.mensaje);
    token = sesion.datos.token;
    expect(sesion.datos.usuario.id).toBe('usr-201');

    const favoritos = new ServicioFavoritosApi(cliente);
    const agregado = await favoritos.agregar('usr-201', 'lug-001');
    expect(esError(agregado)).toBe(false);
    const lista = await favoritos.listar('usr-201');
    expect(!esError(lista) && lista.datos.some((f) => f.lugarId === 'lug-001')).toBe(true);
    expect(await favoritos.quitar('usr-201', 'lug-001')).toEqual({ datos: null, meta: null });
  });

  it('con una contraseña incorrecta devuelve CREDENCIALES_INVALIDAS', async () => {
    const r = await new ServicioAuthApi(cliente).iniciarSesion({ email: 'lucia@mail.com', password: 'mala' });
    expect(r).toEqual({ error: expect.objectContaining({ codigo: 'CREDENCIALES_INVALIDAS' }) });
  });
});
