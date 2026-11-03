import { ErrorDeServicio, esError, type ErrorApi, type RespuestaApi } from '@/src/tipos/api';

export type MetodoHttp = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface OpcionesPedido {
  metodo?: MetodoHttp;
  /** Ruta de la API, por ejemplo `/lugares`. */
  ruta: string;
  consulta?: Record<string, string | number | boolean | null | undefined>;
  /** Cuerpo JSON. */
  cuerpo?: unknown;
  /** Cuerpo `multipart/form-data` (subida de archivos). */
  formulario?: FormData;
  /** Manda el token. Sin sesión devuelve NO_AUTENTICADO sin tocar la red. */
  conSesion?: boolean;
  /** Token explícito (si no, se lee del almacén seguro). */
  token?: string | null;
  timeoutMs?: number;
}

export interface OpcionesLista {
  conSesion?: boolean;
  porPagina?: number;
}

export interface ClienteApi {
  pedir<T>(opciones: OpcionesPedido): Promise<RespuestaApi<T>>;
  /** Pide todas las páginas de una lista y las junta. */
  pedirTodo<T>(
    ruta: string,
    consulta?: OpcionesPedido['consulta'],
    opciones?: OpcionesLista
  ): Promise<RespuestaApi<T[]>>;
}

export interface DependenciasCliente {
  urlBase: string;
  leerToken: () => Promise<string | null>;
  fetch?: typeof fetch;
  timeoutMs?: number;
}

const TIMEOUT_POR_DEFECTO_MS = 30_000; // el plan gratis de Render tarda ~1 min en despertar
const POR_PAGINA_POR_DEFECTO = 50;
const MAXIMO_DE_PAGINAS = 40;

export const SIN_SESION: ErrorApi = {
  codigo: 'NO_AUTENTICADO',
  mensaje: 'Tenés que ingresar con tu cuenta para hacer esto.',
};

const esObjeto = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null;

export function construirUrl(urlBase: string, ruta: string, consulta?: OpcionesPedido['consulta']): string {
  const base = urlBase.replace(/\/+$/, '');
  const camino = ruta.startsWith('/') ? ruta : `/${ruta}`;
  const parametros = new URLSearchParams();
  for (const [clave, valor] of Object.entries(consulta ?? {})) {
    if (valor !== null && valor !== undefined) parametros.append(clave, String(valor));
  }
  const texto = parametros.toString();
  return texto ? `${base}${camino}?${texto}` : `${base}${camino}`;
}

/**
 * Convierte la respuesta cruda en `{ datos, meta }` o `{ error }`. Si el
 * servidor contesta algo que no es de la API (una página de error del
 * hosting mientras se despierta, por ejemplo) lanza `RESPUESTA_INVALIDA`,
 * que las pantallas tratan igual que una falla de red.
 */
export function interpretarRespuesta<T>(estado: number, texto: string): RespuestaApi<T> {
  if (estado === 204) return { datos: null as T, meta: null };
  let json: unknown;
  try {
    json = JSON.parse(texto);
  } catch {
    throw new ErrorDeServicio('RESPUESTA_INVALIDA', 'El servidor contestó algo que no entendemos. Probá de nuevo en un rato.');
  }
  if (esObjeto(json) && esObjeto(json.error)) {
    return {
      error: {
        codigo: typeof json.error.codigo === 'string' ? json.error.codigo : 'ERROR_INTERNO',
        mensaje: typeof json.error.mensaje === 'string' ? json.error.mensaje : 'Algo salió mal. Probá de nuevo en un rato.',
      },
    };
  }
  if (esObjeto(json) && 'datos' in json) {
    return { datos: json.datos as T, meta: (json.meta as never) ?? null };
  }
  throw new ErrorDeServicio('RESPUESTA_INVALIDA', 'El servidor contestó algo que no entendemos. Probá de nuevo en un rato.');
}

export function crearCliente(deps: DependenciasCliente): ClienteApi {
  const hacerFetch = deps.fetch ?? fetch;

  async function pedir<T>(opciones: OpcionesPedido): Promise<RespuestaApi<T>> {
    const token = opciones.conSesion ? (opciones.token ?? (await deps.leerToken())) : null;
    if (opciones.conSesion && !token) return { error: SIN_SESION };

    const encabezados: Record<string, string> = { Accept: 'application/json' };
    if (token) encabezados.Authorization = `Bearer ${token}`;
    let cuerpo: BodyInit | undefined;
    if (opciones.formulario) {
      cuerpo = opciones.formulario; // el Content-Type con el boundary lo pone React Native
    } else if (opciones.cuerpo !== undefined) {
      encabezados['Content-Type'] = 'application/json';
      cuerpo = JSON.stringify(opciones.cuerpo);
    }

    const control = new AbortController();
    const reloj = setTimeout(() => control.abort(), opciones.timeoutMs ?? deps.timeoutMs ?? TIMEOUT_POR_DEFECTO_MS);
    let respuesta: Response;
    try {
      respuesta = await hacerFetch(construirUrl(deps.urlBase, opciones.ruta, opciones.consulta), {
        method: opciones.metodo ?? 'GET',
        headers: encabezados,
        body: cuerpo,
        signal: control.signal,
      });
    } catch {
      throw new ErrorDeServicio('SIN_RED', 'No hay conexión con el servidor.');
    } finally {
      clearTimeout(reloj);
    }
    return interpretarRespuesta<T>(respuesta.status, await respuesta.text());
  }

  async function pedirTodo<T>(
    ruta: string,
    consulta: OpcionesPedido['consulta'] = {},
    opciones: OpcionesLista = {}
  ): Promise<RespuestaApi<T[]>> {
    const porPagina = opciones.porPagina ?? POR_PAGINA_POR_DEFECTO;
    const todos: T[] = [];
    for (let pagina = 1; pagina <= MAXIMO_DE_PAGINAS; pagina += 1) {
      const r = await pedir<T[]>({ ruta, consulta: { ...consulta, pagina, porPagina }, conSesion: opciones.conSesion });
      if (esError(r)) return r;
      todos.push(...r.datos);
      const total = r.meta?.total ?? todos.length;
      if (r.datos.length === 0 || todos.length >= total) break;
    }
    return { datos: todos, meta: { total: todos.length, pagina: 1, porPagina: Math.max(todos.length, 1) } };
  }

  return { pedir, pedirTodo };
}
