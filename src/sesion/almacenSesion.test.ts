import { crearKVStoreEnMemoria } from '@/src/almacenamiento/kvStore';
import { ServicioAuthDePrueba } from '@/src/servicios/auth/servicioAuthDePrueba';
import type { ServicioAuth } from '@/src/servicios/auth/ServicioAuth';
import { ErrorDeServicio } from '@/src/tipos/api';
import { AlmacenSesion, MENSAJE_SIN_RED } from './almacenSesion';
import { crearBiometriaDePrueba } from './biometria';
import { crearTokenStoreEnMemoria } from './tokenStore';
import { validarIngreso, validarRegistro } from './validaciones';

function armar(opciones: { biometria?: boolean; aceptaBiometria?: boolean; auth?: ServicioAuth } = {}) {
  const tokens = crearTokenStoreEnMemoria();
  const kv = crearKVStoreEnMemoria();
  const auth = opciones.auth ?? new ServicioAuthDePrueba(0);
  const biometria = crearBiometriaDePrueba(opciones.biometria ?? false, opciones.aceptaBiometria ?? true);
  const nueva = () => new AlmacenSesion({ auth, tokens, kv, biometria });
  return { tokens, kv, auth, nueva, sesion: nueva() };
}

describe('AlmacenSesion', () => {
  it('sin sesión guardada arranca como invitado', async () => {
    const { sesion } = armar();
    expect(sesion.obtener().estado).toBe('cargando');
    await sesion.iniciar();
    expect(sesion.obtener().estado).toBe('invitado');
    expect(sesion.obtener().usuario).toBeNull();
  });

  it('inicia sesión, guarda el token y queda activa', async () => {
    const { sesion, tokens } = armar();
    await sesion.iniciar();
    const r = await sesion.iniciarSesion({ email: 'lucia@mail.com', password: '123456' });
    expect(r.ok).toBe(true);
    expect(sesion.obtener().estado).toBe('activa');
    expect(sesion.obtener().usuario?.id).toBe('usr-201');
    expect(await tokens.leer()).toMatch(/^tok-/);
  });

  it('con contraseña incorrecta muestra el error y sigue como invitado', async () => {
    const { sesion, tokens } = armar();
    await sesion.iniciar();
    const r = await sesion.iniciarSesion({ email: 'lucia@mail.com', password: 'mala' });
    expect(r.ok).toBe(false);
    expect(sesion.obtener().estado).toBe('invitado');
    expect(sesion.obtener().error).toMatch(/no son correctos/);
    expect(await tokens.leer()).toBeNull();
  });

  it('sin señal no se rompe: avisa y deja reintentar', async () => {
    const { sesion } = armar();
    await sesion.iniciar();
    const r = await sesion.iniciarSesion({ email: 'x@sinred.com', password: '123456' });
    expect(r).toEqual({ ok: false, error: MENSAJE_SIN_RED });
    expect(sesion.obtener().ocupado).toBe(false);
  });

  it('registra una cuenta nueva y rechaza un email repetido', async () => {
    const { sesion } = armar();
    await sesion.iniciar();
    expect((await sesion.registrar({ nombre: 'Ana', email: 'ana@mail.com', password: 'secreto1' })).ok).toBe(true);
    expect(sesion.obtener().usuario?.nombre).toBe('Ana');
    await sesion.cerrarSesion();
    const repetido = await sesion.registrar({ nombre: 'Ana', email: 'ANA@mail.com', password: 'otra123' });
    expect(repetido.ok).toBe(false);
    expect(sesion.obtener().error).toMatch(/Ya existe/);
  });

  it('al reabrir la app con la sesión guardada entra sin pedir contraseña', async () => {
    const { sesion, nueva } = armar();
    await sesion.iniciar();
    await sesion.iniciarSesion({ email: 'lucia@mail.com', password: '123456' });
    const reabierta = nueva();
    await reabierta.iniciar();
    expect(reabierta.obtener().estado).toBe('activa');
    expect(reabierta.obtener().usuario?.email).toBe('lucia@mail.com');
  });

  it('con huella activada queda bloqueada hasta que la persona confirma', async () => {
    const { sesion, nueva } = armar({ biometria: true });
    await sesion.iniciar();
    await sesion.iniciarSesion({ email: 'lucia@mail.com', password: '123456' });
    expect((await sesion.activarBiometria(true)).ok).toBe(true);

    const reabierta = nueva();
    await reabierta.iniciar();
    expect(reabierta.obtener().estado).toBe('bloqueada');
    expect((await reabierta.desbloquear()).ok).toBe(true);
    expect(reabierta.obtener().estado).toBe('activa');
  });

  it('si la huella falla sigue bloqueada y se puede usar la contraseña', async () => {
    const dueño = armar({ biometria: true });
    await dueño.sesion.iniciar();
    await dueño.sesion.iniciarSesion({ email: 'lucia@mail.com', password: '123456' });
    await dueño.sesion.activarBiometria(true);

    const rechaza = new AlmacenSesion({
      auth: dueño.auth,
      tokens: dueño.tokens,
      kv: dueño.kv,
      biometria: crearBiometriaDePrueba(true, false),
    });
    await rechaza.iniciar();
    expect(rechaza.obtener().estado).toBe('bloqueada');
    const r = await rechaza.desbloquear();
    expect(r.ok).toBe(false);
    expect(rechaza.obtener().estado).toBe('bloqueada');

    await rechaza.usarContrasena();
    expect(rechaza.obtener().estado).toBe('invitado');
    expect(await dueño.tokens.leer()).toBeNull();
  });

  it('no deja activar la huella si el teléfono no tiene', async () => {
    const { sesion } = armar({ biometria: false });
    await sesion.iniciar();
    const r = await sesion.activarBiometria(true);
    expect(r.ok).toBe(false);
    expect(sesion.obtener().biometriaActivada).toBe(false);
  });

  it('si el servidor dice que la sesión venció, la descarta', async () => {
    const { tokens, nueva } = armar();
    await tokens.guardar('vencido-123');
    const s = nueva();
    await s.iniciar();
    expect(s.obtener().estado).toBe('invitado');
    expect(await tokens.leer()).toBeNull();
  });

  it('sin señal al reabrir sigue activa con el usuario guardado', async () => {
    const base = new ServicioAuthDePrueba(0);
    let hayRed = true;
    const auth: ServicioAuth = {
      registrar: (d) => base.registrar(d),
      iniciarSesion: (d) => base.iniciarSesion(d),
      obtenerUsuario: async (t) => {
        if (!hayRed) throw new ErrorDeServicio('SIN_RED', 'sin red');
        return base.obtenerUsuario(t);
      },
      actualizarPreferencias: (t, p) => base.actualizarPreferencias(t, p),
      cerrarSesion: (t) => base.cerrarSesion(t),
    };
    const { sesion, nueva } = armar({ auth });
    await sesion.iniciar();
    await sesion.iniciarSesion({ email: 'lucia@mail.com', password: '123456' });
    hayRed = false;
    const reabierta = nueva();
    await reabierta.iniciar();
    expect(reabierta.obtener().estado).toBe('activa');
    expect(reabierta.obtener().usuario?.nombre).toBe('Lucía Méndez');
  });

  it('cerrar sesión borra el token y vuelve a invitado', async () => {
    const { sesion, tokens } = armar();
    await sesion.iniciar();
    await sesion.iniciarSesion({ email: 'lucia@mail.com', password: '123456' });
    await sesion.cerrarSesion();
    expect(sesion.obtener().estado).toBe('invitado');
    expect(await tokens.leer()).toBeNull();
  });

  it('guarda las preferencias en el teléfono y avisa a los oyentes', async () => {
    const { sesion } = armar();
    await sesion.iniciar();
    await sesion.iniciarSesion({ email: 'lucia@mail.com', password: '123456' });
    const oyente = jest.fn();
    sesion.suscribir(oyente);
    const prefs = { ...sesion.obtener().usuario!.preferencias, radioAvisoMetros: 500 as const };
    await sesion.guardarPreferencias(prefs);
    expect(sesion.obtener().usuario?.preferencias.radioAvisoMetros).toBe(500);
    expect(oyente).toHaveBeenCalled();
  });
});

describe('validaciones de la cuenta', () => {
  it('pide un email válido y una contraseña', () => {
    expect(validarIngreso({ email: 'sin-arroba', password: '123456' })).toMatch(/email válido/);
    expect(validarIngreso({ email: 'a@b.co', password: '' })).toMatch(/contraseña/);
    expect(validarIngreso({ email: ' a@b.co ', password: 'x' })).toBeNull();
  });

  it('al crear la cuenta exige nombre y 6 caracteres', () => {
    expect(validarRegistro({ nombre: ' ', email: 'a@b.co', password: '123456' })).toMatch(/nombre/);
    expect(validarRegistro({ nombre: 'Ana', email: 'a@b.co', password: '123' })).toMatch(/al menos 6/);
    expect(validarRegistro({ nombre: 'Ana', email: 'a@b.co', password: '123456' })).toBeNull();
  });
});
