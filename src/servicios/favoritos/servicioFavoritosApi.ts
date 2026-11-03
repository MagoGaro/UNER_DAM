import type { ClienteApi } from '@/src/servicios/api/cliente';
import type { RespuestaApi } from '@/src/tipos/api';
import type { Favorito } from '@/src/tipos/favorito';
import type { ServicioFavoritos } from './ServicioFavoritos';

/** Favoritos contra la API real. El usuario sale del token, no del `usuarioId`. */
export class ServicioFavoritosApi implements ServicioFavoritos {
  constructor(private readonly cliente: ClienteApi) {}

  listar(_usuarioId?: string): Promise<RespuestaApi<Favorito[]>> {
    return this.cliente.pedirTodo<Favorito>('/yo/favoritos', {}, { conSesion: true });
  }

  agregar(_usuarioId: string, lugarId: string): Promise<RespuestaApi<Favorito>> {
    return this.cliente.pedir<Favorito>({
      metodo: 'PUT',
      ruta: `/yo/favoritos/${encodeURIComponent(lugarId)}`,
      conSesion: true,
    });
  }

  quitar(_usuarioId: string, lugarId: string): Promise<RespuestaApi<null>> {
    return this.cliente.pedir<null>({
      metodo: 'DELETE',
      ruta: `/yo/favoritos/${encodeURIComponent(lugarId)}`,
      conSesion: true,
    });
  }
}
