import { guardarJSON, leerJSON, type KVStore } from '@/src/almacenamiento/kvStore';
import type { ServicioAuth } from '@/src/servicios/auth/ServicioAuth';
import { ErrorDeServicio, esError } from '@/src/tipos/api';
import type { Preferencias } from '@/src/tipos/preferencias';
import type { Usuario } from '@/src/tipos/usuario';
import type { Biometria } from './biometria';
import type { TokenStore } from './tokenStore';

/**
 * invitado: sin cuenta (puede usar todo menos guardar en la nube).
 * bloqueada: hay sesión guardada y espera huella/rostro.
 * activa: hay sesión.
 */
export type EstadoSesion = 'cargando' | 'invitado' | 'bloqueada' | 'activa';

export interface InstantaneaSesion {
  estado: EstadoSesion;
  usuario: Usuario | null;
  biometriaDisponible: boolean;
  biometriaActivada: boolean;
  ocupado: boolean;
  error: string | null;
}

export interface ResultadoAccion {
  ok: boolean;
  error?: string;
}

const CLAVE_USUARIO = 'sesion.usuario';
const CLAVE_BIOMETRIA = 'sesion.biometria';
export const MENSAJE_SIN_RED = 'No hay conexión. Probá de nuevo cuando tengas señal.';

export interface DependenciasSesion {
  auth: ServicioAuth;
  tokens: TokenStore;
  kv: KVStore;
  biometria: Biometria;
  /** Se ejecuta antes de borrar el token al cerrar sesión (por ejemplo, dar de baja el teléfono de las push). */
  antesDeCerrarSesion?: () => Promise<void>;
}

/**
 * Estado de la cuenta. No depende de React ni de Expo: todo lo de afuera
 * entra por `DependenciasSesion`, así se prueba con datos en memoria.
 */
export class AlmacenSesion {
  private estado: InstantaneaSesion = {
    estado: 'cargando',
    usuario: null,
    biometriaDisponible: false,
    biometriaActivada: false,
    ocupado: false,
    error: null,
  };
  private readonly oyentes = new Set<() => void>();
  private iniciada: Promise<void> | null = null;

  constructor(private readonly deps: DependenciasSesion) {}

  obtener = (): InstantaneaSesion => this.estado;

  suscribir = (oyente: () => void): (() => void) => {
    this.oyentes.add(oyente);
    return () => {
      this.oyentes.delete(oyente);
    };
  };

  private poner(cambios: Partial<InstantaneaSesion>): void {
    this.estado = { ...this.estado, ...cambios };
    this.oyentes.forEach((o) => o());
  }

  /** Se llama una vez al abrir la app. Nunca lanza. */
  iniciar(): Promise<void> {
    if (!this.iniciada) this.iniciada = this.arrancar();
    return this.iniciada;
  }

  private async arrancar(): Promise<void> {
    const [biometriaDisponible, activada, token, usuarioGuardado] = await Promise.all([
      this.deps.biometria.disponible(),
      leerJSON<boolean>(this.deps.kv, CLAVE_BIOMETRIA, false),
      this.deps.tokens.leer(),
      leerJSON<Usuario | null>(this.deps.kv, CLAVE_USUARIO, null),
    ]);
    const biometriaActivada = activada && biometriaDisponible;
    this.poner({ biometriaDisponible, biometriaActivada });

    if (!token) {
      this.poner({ estado: 'invitado', usuario: null });
      return;
    }
    if (biometriaActivada) {
      this.poner({ estado: 'bloqueada', usuario: usuarioGuardado });
      return;
    }
    await this.activarConToken(token, usuarioGuardado);
  }

  /** Confirma el token con el servidor; sin señal, sigue con el usuario guardado. */
  private async activarConToken(token: string, usuarioGuardado: Usuario | null): Promise<void> {
    try {
      const r = await this.deps.auth.obtenerUsuario(token);
      if (esError(r)) {
        await this.olvidarSesion();
        return;
      }
      await guardarJSON(this.deps.kv, CLAVE_USUARIO, r.datos);
      this.poner({ estado: 'activa', usuario: r.datos, error: null });
    } catch (e) {
      if (e instanceof ErrorDeServicio && usuarioGuardado) {
        this.poner({ estado: 'activa', usuario: usuarioGuardado });
      } else {
        this.poner({ estado: 'invitado', usuario: null });
      }
    }
  }

  private async olvidarSesion(): Promise<void> {
    await this.deps.tokens.borrar();
    await this.deps.kv.borrar?.(CLAVE_USUARIO);
    this.poner({ estado: 'invitado', usuario: null });
  }

  private async ingresarCon(llamada: () => ReturnType<ServicioAuth['iniciarSesion']>): Promise<ResultadoAccion> {
    this.poner({ ocupado: true, error: null });
    try {
      const r = await llamada();
      if (esError(r)) {
        this.poner({ ocupado: false, error: r.error.mensaje });
        return { ok: false, error: r.error.mensaje };
      }
      await this.deps.tokens.guardar(r.datos.token);
      await guardarJSON(this.deps.kv, CLAVE_USUARIO, r.datos.usuario);
      this.poner({ ocupado: false, estado: 'activa', usuario: r.datos.usuario, error: null });
      return { ok: true };
    } catch {
      this.poner({ ocupado: false, error: MENSAJE_SIN_RED });
      return { ok: false, error: MENSAJE_SIN_RED };
    }
  }

  registrar(datos: { nombre: string; email: string; password: string }): Promise<ResultadoAccion> {
    return this.ingresarCon(() => this.deps.auth.registrar(datos));
  }

  iniciarSesion(datos: { email: string; password: string }): Promise<ResultadoAccion> {
    return this.ingresarCon(() => this.deps.auth.iniciarSesion(datos));
  }

  /** Huella o rostro: si sale bien, entra; si no, queda bloqueada y puede reintentar o usar la contraseña. */
  async desbloquear(): Promise<ResultadoAccion> {
    if (this.estado.estado !== 'bloqueada') return { ok: true };
    this.poner({ ocupado: true, error: null });
    const paso = await this.deps.biometria.autenticar('Ingresá a tu cuenta de Mi Ciudad Colón');
    if (!paso) {
      const error = 'No pudimos verificar tu huella o rostro.';
      this.poner({ ocupado: false, error });
      return { ok: false, error };
    }
    const token = await this.deps.tokens.leer();
    if (!token) {
      this.poner({ ocupado: false });
      await this.olvidarSesion();
      return { ok: false, error: 'La sesión venció. Volvé a ingresar.' };
    }
    await this.activarConToken(token, this.estado.usuario);
    this.poner({ ocupado: false });
    return { ok: true };
  }

  /** «Usar contraseña»: descarta la sesión guardada para ingresar de cero. */
  async usarContrasena(): Promise<void> {
    await this.olvidarSesion();
  }

  async cerrarSesion(): Promise<void> {
    await this.ejecutarAntesDeCerrar();
    const token = await this.deps.tokens.leer();
    if (token) {
      try {
        await this.deps.auth.cerrarSesion(token);
      } catch {
        // Sin señal: igual se cierra acá.
      }
    }
    await this.olvidarSesion();
  }

  /** Tarea previa al cierre, sin trabar nunca: falla en silencio y espera como mucho 4 segundos. */
  private async ejecutarAntesDeCerrar(): Promise<void> {
    const tarea = this.deps.antesDeCerrarSesion;
    if (!tarea) return;
    let reloj: ReturnType<typeof setTimeout> | undefined;
    const limite = new Promise<void>((resolver) => {
      reloj = setTimeout(resolver, 4000);
    });
    try {
      await Promise.race([tarea().catch(() => {}), limite]);
    } finally {
      clearTimeout(reloj);
    }
  }

  async activarBiometria(activar: boolean): Promise<ResultadoAccion> {
    if (activar) {
      if (!this.estado.biometriaDisponible) {
        return { ok: false, error: 'Este teléfono no tiene huella o rostro configurados.' };
      }
      const paso = await this.deps.biometria.autenticar('Confirmá para activar el ingreso rápido');
      if (!paso) return { ok: false, error: 'No pudimos verificar tu huella o rostro.' };
    }
    await guardarJSON(this.deps.kv, CLAVE_BIOMETRIA, activar);
    this.poner({ biometriaActivada: activar });
    return { ok: true };
  }

  async guardarPreferencias(preferencias: Preferencias): Promise<ResultadoAccion> {
    const { usuario } = this.estado;
    if (!usuario) return { ok: false, error: 'Ingresá para guardar tus preferencias.' };
    const mejorado: Usuario = { ...usuario, preferencias };
    this.poner({ usuario: mejorado });
    await guardarJSON(this.deps.kv, CLAVE_USUARIO, mejorado);
    try {
      const token = await this.deps.tokens.leer();
      if (token) await this.deps.auth.actualizarPreferencias(token, preferencias);
    } catch {
      // Quedan guardadas en el teléfono; se reenvían la próxima vez que cambie algo.
    }
    return { ok: true };
  }
}
