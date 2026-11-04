import type { RespuestaApi } from '@/src/tipos/api';
import type { Usuario } from '@/src/tipos/usuario';

export interface SesionApi {
  /** Va en la cabecera `Authorization: Bearer <token>`. Se guarda en expo-secure-store. */
  token: string;
  usuario: Usuario;
}

export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
}

export interface DatosIngreso {
  email: string;
  password: string;
}

/**
 * Puerto de la cuenta (`/auth` y `/yo`). Los métodos pueden lanzar
 * `ErrorDeServicio` ("SIN_RED") si no hay conexión con el servidor.
 */
export interface ServicioAuth {
  registrar(datos: DatosRegistro): Promise<RespuestaApi<SesionApi>>;
  iniciarSesion(datos: DatosIngreso): Promise<RespuestaApi<SesionApi>>;
  obtenerUsuario(token: string): Promise<RespuestaApi<Usuario>>;
  actualizarPreferencias(token: string, preferencias: Usuario['preferencias']): Promise<RespuestaApi<Usuario>>;
  cerrarSesion(token: string): Promise<RespuestaApi<null>>;
}
