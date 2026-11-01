import { PREFERENCIAS_POR_DEFECTO } from '@/src/configuracion/preferenciasPorDefecto';
import { ErrorDeServicio, type RespuestaApi } from '@/src/tipos/api';
import type { Usuario } from '@/src/tipos/usuario';
import type { DatosIngreso, DatosRegistro, ServicioAuth, SesionApi } from './ServicioAuth';

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
const error = (codigo: string, mensaje: string): { error: { codigo: string; mensaje: string } } => ({
  error: { codigo, mensaje },
});

interface Cuenta {
  usuario: Usuario;
  password: string;
}

/**
 * Mock de la cuenta. Datos para probar: lucia@mail.com / 123456.
 * Casos feos a propósito: un email con "sinred" simula que no hay señal
 * (lanza `ErrorDeServicio('SIN_RED')`), y un token que empieza con
 * "vencido" devuelve SESION_VENCIDA.
 */
export class ServicioAuthDePrueba implements ServicioAuth {
  private readonly cuentas = new Map<string, Cuenta>();
  private readonly tokens = new Map<string, string>(); // token -> email
  private contador = 300;

  constructor(private readonly demoraMs = 500) {
    this.cuentas.set('lucia@mail.com', {
      password: '123456',
      usuario: {
        id: 'usr-201',
        nombre: 'Lucía Méndez',
        email: 'lucia@mail.com',
        avatarUrl: null,
        creadoEn: '2026-09-02T18:20:00-03:00',
        preferencias: {
          ...PREFERENCIAS_POR_DEFECTO,
          categoriasFavoritas: ['cat-museos', 'cat-playas'],
        },
      },
    });
  }

  private emitirToken(email: string): string {
    const token = `tok-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    this.tokens.set(token, email);
    return token;
  }

  private simularRed(email: string): void {
    if (email.includes('sinred')) throw new ErrorDeServicio('SIN_RED', 'No hay conexión.');
  }

  async registrar({ nombre, email, password }: DatosRegistro): Promise<RespuestaApi<SesionApi>> {
    await esperar(this.demoraMs);
    const clave = email.trim().toLowerCase();
    this.simularRed(clave);
    if (this.cuentas.has(clave)) {
      return error('EMAIL_YA_REGISTRADO', 'Ya existe una cuenta con ese email.');
    }
    this.contador += 1;
    const usuario: Usuario = {
      id: `usr-${this.contador}`,
      nombre: nombre.trim(),
      email: clave,
      avatarUrl: null,
      creadoEn: new Date().toISOString(),
      preferencias: { ...PREFERENCIAS_POR_DEFECTO },
    };
    this.cuentas.set(clave, { usuario, password });
    return { datos: { token: this.emitirToken(clave), usuario }, meta: null };
  }

  async iniciarSesion({ email, password }: DatosIngreso): Promise<RespuestaApi<SesionApi>> {
    await esperar(this.demoraMs);
    const clave = email.trim().toLowerCase();
    this.simularRed(clave);
    const cuenta = this.cuentas.get(clave);
    if (!cuenta || cuenta.password !== password) {
      return error('CREDENCIALES_INVALIDAS', 'El email o la contraseña no son correctos.');
    }
    return { datos: { token: this.emitirToken(clave), usuario: cuenta.usuario }, meta: null };
  }

  async obtenerUsuario(token: string): Promise<RespuestaApi<Usuario>> {
    await esperar(this.demoraMs / 2);
    const email = this.tokens.get(token);
    if (token.startsWith('vencido') || !email) {
      return error('SESION_VENCIDA', 'La sesión venció. Volvé a ingresar.');
    }
    return { datos: this.cuentas.get(email)!.usuario, meta: null };
  }

  async actualizarPreferencias(token: string, preferencias: Usuario['preferencias']): Promise<RespuestaApi<Usuario>> {
    await esperar(this.demoraMs / 2);
    const email = this.tokens.get(token);
    const cuenta = email ? this.cuentas.get(email) : undefined;
    if (!cuenta) return error('SESION_VENCIDA', 'La sesión venció. Volvé a ingresar.');
    cuenta.usuario = { ...cuenta.usuario, preferencias };
    return { datos: cuenta.usuario, meta: null };
  }

  async cerrarSesion(token: string): Promise<RespuestaApi<null>> {
    await esperar(this.demoraMs / 4);
    this.tokens.delete(token);
    return { datos: null, meta: null };
  }
}
