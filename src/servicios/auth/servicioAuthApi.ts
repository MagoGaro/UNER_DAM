import type { ClienteApi } from '@/src/servicios/api/cliente';
import type { RespuestaApi } from '@/src/tipos/api';
import type { Usuario } from '@/src/tipos/usuario';
import type { DatosIngreso, DatosRegistro, ServicioAuth, SesionApi } from './ServicioAuth';

/** Cuenta contra la API real: `/auth/registro`, `/auth/ingreso` y `/yo`. */
export class ServicioAuthApi implements ServicioAuth {
  constructor(private readonly cliente: ClienteApi) {}

  registrar({ nombre, email, password }: DatosRegistro): Promise<RespuestaApi<SesionApi>> {
    return this.cliente.pedir<SesionApi>({
      metodo: 'POST',
      ruta: '/auth/registro',
      cuerpo: { nombre, email, contrasena: password },
    });
  }

  iniciarSesion({ email, password }: DatosIngreso): Promise<RespuestaApi<SesionApi>> {
    return this.cliente.pedir<SesionApi>({
      metodo: 'POST',
      ruta: '/auth/ingreso',
      cuerpo: { email, contrasena: password },
    });
  }

  obtenerUsuario(token: string): Promise<RespuestaApi<Usuario>> {
    return this.cliente.pedir<Usuario>({ ruta: '/yo', conSesion: true, token });
  }

  actualizarPreferencias(token: string, preferencias: Usuario['preferencias']): Promise<RespuestaApi<Usuario>> {
    return this.cliente.pedir<Usuario>({
      metodo: 'PATCH',
      ruta: '/yo',
      conSesion: true,
      token,
      cuerpo: { preferencias },
    });
  }

  /** La API no tiene cierre de sesión: el token es de 30 días y alcanza con olvidarlo en el teléfono. */
  async cerrarSesion(): Promise<RespuestaApi<null>> {
    return { datos: null, meta: null };
  }
}
