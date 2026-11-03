import type { ClienteApi } from '@/src/servicios/api/cliente';
import { esError, type RespuestaApi } from '@/src/tipos/api';
import type { Visita } from '@/src/tipos/visita';
import type { ServicioVisitasApi } from './ServicioVisitasApi';

interface ArchivoSubido {
  url: string;
  tipo: 'imagen' | 'audio' | 'video';
  bytes: number;
}

/** Sube un archivo local y devuelve su URL pública (o el error de la API). */
export type SubirArchivo = (uriLocal: string) => Promise<RespuestaApi<ArchivoSubido>>;

const TIPOS: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export function tipoMimeDeFoto(uri: string): string {
  const extension = uri.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  return TIPOS[extension] ?? 'image/jpeg';
}

/** `POST /archivos` (multipart, campo `archivo`): primero se sube la foto y después se usa su `url`. */
export function crearSubidaDeFotos(cliente: ClienteApi): SubirArchivo {
  return (uriLocal) => {
    const formulario = new FormData();
    const nombre = `visita-${Date.now().toString(36)}.${tipoMimeDeFoto(uriLocal).split('/')[1].replace('jpeg', 'jpg')}`;
    // React Native arma el archivo a partir de { uri, name, type }.
    formulario.append('archivo', { uri: uriLocal, name: nombre, type: tipoMimeDeFoto(uriLocal) } as unknown as Blob);
    return cliente.pedir<ArchivoSubido>({
      metodo: 'POST',
      ruta: '/archivos',
      formulario,
      conSesion: true,
      timeoutMs: 60_000,
    });
  };
}

/**
 * Mi recorrido contra la API real. Una visita pide sesión: si la persona
 * todavía no ingresó, devuelve NO_AUTENTICADO y la visita espera en la cola
 * del teléfono hasta que ingrese.
 */
export class ServicioVisitasHttp implements ServicioVisitasApi {
  constructor(
    private readonly cliente: ClienteApi,
    private readonly subirArchivo: SubirArchivo = crearSubidaDeFotos(cliente)
  ) {}

  async subirVisita(visita: Visita): Promise<RespuestaApi<Visita>> {
    let fotoUrl: string | null = visita.fotoUri;
    if (fotoUrl && !/^https?:\/\//i.test(fotoUrl)) {
      const subida = await this.subirArchivo(fotoUrl);
      if (esError(subida)) return subida;
      fotoUrl = subida.datos.url;
    }
    const creada = await this.cliente.pedir<Visita>({
      metodo: 'POST',
      ruta: '/yo/visitas',
      conSesion: true,
      cuerpo: {
        id: visita.id,
        lugarId: visita.lugarId,
        fechaHora: visita.fechaHora,
        origen: visita.origen,
        fotoUri: fotoUrl,
        nota: visita.nota,
      },
    });
    if (esError(creada)) return creada;

    // `POST` es idempotente por id: si la visita ya existía devuelve la que tenía el servidor.
    // Si la persona cambió la nota o la foto, hay que mandar el cambio con `PATCH`.
    const cambios: { nota?: string; fotoUri?: string } = {};
    if ((creada.datos.nota ?? null) !== (visita.nota ?? null)) cambios.nota = visita.nota ?? '';
    if (fotoUrl && creada.datos.fotoUri !== fotoUrl) cambios.fotoUri = fotoUrl;
    if (Object.keys(cambios).length === 0) return creada;
    return this.cliente.pedir<Visita>({
      metodo: 'PATCH',
      ruta: `/yo/visitas/${encodeURIComponent(visita.id)}`,
      conSesion: true,
      cuerpo: cambios,
    });
  }

  listarVisitas(): Promise<RespuestaApi<Visita[]>> {
    return this.cliente.pedirTodo<Visita>('/yo/visitas', {}, { conSesion: true, porPagina: 500 });
  }

  /** La API no permite borrar visitas: se borra del teléfono y queda en la cuenta. */
  async eliminarVisita(): Promise<RespuestaApi<null>> {
    return { datos: null, meta: null };
  }
}
