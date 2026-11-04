import { guardarJSON, kvStorePersistente, leerJSON, type KVStore } from '@/src/almacenamiento/kvStore';
import { servicioRecordatoriosExpo, type ServicioRecordatorios } from '@/src/notificaciones/recordatoriosEventos';
import { servicioEventos as servicioPorDefecto, type ServicioEventos } from '@/src/servicios/eventos';
import { servicioEventosGuardados, type ServicioEventosGuardados } from '@/src/servicios/eventosGuardados';
import { esError } from '@/src/tipos/api';
import type { Evento } from '@/src/tipos/evento';
import { crearAlmacen, type Almacen } from '@/src/utils/almacen';
import { aISOConZona, inicioDelDia, sumarDias } from '@/src/utils/fechas';
import {
  detectarCambios,
  estaVigente,
  estadoVisible,
  momentoRecordatorio,
  textoCambio,
  type EventoGuardado,
} from './logicaAgenda';

/** Cuántos días hacia adelante muestra la agenda (empezando por hoy). */
export const DIAS_AGENDA = 14;

const CLAVE_CACHE = 'agenda:cache.api.v1';
const CLAVE_GUARDADOS = 'agenda:guardados.api.v1';

export type EstadoCargaAgenda = 'inicial' | 'cargando' | 'listo' | 'error';

export interface EstadoAgenda {
  eventos: Evento[];
  estado: EstadoCargaAgenda;
  /** true cuando lo que se muestra es la copia guardada en el teléfono (sin señal). */
  desdeCache: boolean;
  actualizadoEn: string | null;
  guardados: Record<string, EventoGuardado>;
  inicializado: boolean;
}

interface CacheAgenda {
  eventos: Evento[];
  actualizadoEn: string;
}

export interface ResultadoGuardar {
  guardado: boolean;
  recordatorio: Date | null;
}

interface Dependencias {
  servicio: ServicioEventos;
  store: KVStore;
  recordatorios: ServicioRecordatorios;
  ahora: () => Date;
  /** Eventos guardados en la cuenta (opcional: sin API no hay nada que sincronizar). */
  guardadosServidor?: ServicioEventosGuardados;
}

export function crearAgenda(deps: Dependencias) {
  const almacen: Almacen<EstadoAgenda> = crearAlmacen<EstadoAgenda>({
    eventos: [],
    estado: 'inicial',
    desdeCache: false,
    actualizadoEn: null,
    guardados: {},
    inicializado: false,
  });

  let inicializando: Promise<void> | null = null;
  let cargaEnCurso: Promise<void> | null = null;

  async function persistirGuardados() {
    await guardarJSON(deps.store, CLAVE_GUARDADOS, almacen.obtener().guardados);
  }

  /** Lee del teléfono la última agenda y los eventos guardados (sirve sin señal). */
  function inicializar(): Promise<void> {
    if (!inicializando) {
      inicializando = (async () => {
        const [cache, guardados] = await Promise.all([
          leerJSON<CacheAgenda | null>(deps.store, CLAVE_CACHE, null),
          leerJSON<Record<string, EventoGuardado>>(deps.store, CLAVE_GUARDADOS, {}),
        ]);
        almacen.actualizar((previo) => ({
          guardados: { ...guardados, ...previo.guardados },
          eventos: previo.eventos.length ? previo.eventos : (cache?.eventos ?? []),
          actualizadoEn: previo.actualizadoEn ?? cache?.actualizadoEn ?? null,
          desdeCache: previo.eventos.length ? previo.desdeCache : Boolean(cache),
          inicializado: true,
        }));
      })();
    }
    return inicializando;
  }

  /** Aplica los cambios de estado de los eventos guardados: avisa y reprograma recordatorios. */
  async function procesarCambios(eventos: Evento[]) {
    const cambios = detectarCambios(almacen.obtener().guardados, eventos);
    if (cambios.length === 0) return;

    const guardados = { ...almacen.obtener().guardados };
    for (const cambio of cambios) {
      const { evento, guardado } = cambio;
      await deps.recordatorios.cancelar(guardado.notificacionId);
      let notificacionId: string | null = null;
      if (cambio.tipo === 'reprogramado' || cambio.tipo === 'reactivado') {
        const cuando = momentoRecordatorio(evento.inicio, deps.ahora());
        if (cuando) notificacionId = await deps.recordatorios.programar(evento, cuando);
      }
      const texto = textoCambio(cambio);
      await deps.recordatorios.avisarAhora(texto.titulo, texto.cuerpo, evento.id);
      guardados[evento.id] = {
        ...guardado,
        titulo: evento.titulo,
        estadoConocido: evento.estado,
        inicioConocido: evento.inicio,
        notificacionId,
      };
    }
    almacen.actualizar({ guardados });
    await persistirGuardados();
  }

  /** Trae la agenda de hoy en adelante. Sin señal, se queda con la copia local. */
  function cargarEventos(): Promise<void> {
    if (cargaEnCurso) return cargaEnCurso;
    cargaEnCurso = (async () => {
      await inicializar();
      almacen.actualizar({ estado: 'cargando' });
      const hoy = inicioDelDia(deps.ahora());
      try {
        const respuesta = await deps.servicio.listarEventos({
          desde: aISOConZona(hoy),
          hasta: aISOConZona(sumarDias(hoy, DIAS_AGENDA)),
        });
        if (esError(respuesta)) throw new Error(respuesta.error.mensaje);
        const actualizadoEn = aISOConZona(deps.ahora());
        almacen.actualizar({ eventos: respuesta.datos, estado: 'listo', desdeCache: false, actualizadoEn });
        await guardarJSON(deps.store, CLAVE_CACHE, { eventos: respuesta.datos, actualizadoEn });
        await procesarCambios(respuesta.datos);
      } catch {
        const hayCopia = almacen.obtener().eventos.length > 0;
        almacen.actualizar({ estado: hayCopia ? 'listo' : 'error', desdeCache: hayCopia });
      } finally {
        cargaEnCurso = null;
      }
    })();
    return cargaEnCurso;
  }

  function estaGuardado(id: string): boolean {
    return Boolean(almacen.obtener().guardados[id]);
  }

  /** Guarda o quita un evento. Al guardar programa el recordatorio si todavía se puede. */
  async function alternarGuardado(evento: Evento): Promise<ResultadoGuardar> {
    await inicializar();
    const guardados = { ...almacen.obtener().guardados };
    const existente = guardados[evento.id];

    if (existente) {
      delete guardados[evento.id];
      almacen.actualizar({ guardados });
      await deps.recordatorios.cancelar(existente.notificacionId);
      await persistirGuardados();
      deps.guardadosServidor?.quitar(evento.id).catch(() => {});
      return { guardado: false, recordatorio: null };
    }

    const resultado = await guardarLocal(evento);
    deps.guardadosServidor?.guardar(evento.id).catch(() => {});
    return resultado;
  }

  /** Guarda el evento en el teléfono y programa el recordatorio si todavía se puede. */
  async function guardarLocal(evento: Evento): Promise<ResultadoGuardar> {
    const guardados = { ...almacen.obtener().guardados };
    const ahora = deps.ahora();
    const vigente = estaVigente(estadoVisible(evento, ahora));
    const cuando = vigente ? momentoRecordatorio(evento.inicio, ahora) : null;
    // Se guarda primero (respuesta instantánea al toque) y después se programa el aviso.
    guardados[evento.id] = {
      id: evento.id,
      titulo: evento.titulo,
      inicioConocido: evento.inicio,
      estadoConocido: evento.estado,
      notificacionId: null,
      guardadoEn: aISOConZona(ahora),
    };
    almacen.actualizar({ guardados });
    const notificacionId = cuando ? await deps.recordatorios.programar(evento, cuando) : null;
    if (notificacionId) {
      almacen.actualizar((previo) =>
        previo.guardados[evento.id]
          ? { guardados: { ...previo.guardados, [evento.id]: { ...previo.guardados[evento.id], notificacionId } } }
          : {}
      );
    }
    await persistirGuardados();
    return { guardado: true, recordatorio: notificacionId ? cuando : null };
  }

  /**
   * Alinea los eventos guardados con los de la cuenta: los que están acá y
   * no en el servidor se suben (así la API sabe a quién avisar) y los de la
   * cuenta que no están acá se agregan (cambio de teléfono). Sin sesión o sin
   * señal no hace nada.
   */
  async function sincronizarGuardados(): Promise<void> {
    const servidor = deps.guardadosServidor;
    if (!servidor) return;
    await inicializar();
    try {
      const remotos = await servidor.listar();
      if (esError(remotos)) return;
      const idsRemotos = new Set(remotos.datos.map((e) => e.id));
      for (const id of Object.keys(almacen.obtener().guardados)) {
        if (!idsRemotos.has(id)) await servidor.guardar(id);
      }
      for (const evento of remotos.datos) {
        if (!almacen.obtener().guardados[evento.id]) await guardarLocal(evento);
      }
    } catch {
      // Sin señal: se reintenta en la próxima actualización.
    }
  }

  return { almacen, inicializar, cargarEventos, alternarGuardado, estaGuardado, sincronizarGuardados };
}

export type Agenda = ReturnType<typeof crearAgenda>;

/** Instancia que usa la app. */
export const agenda: Agenda = crearAgenda({
  servicio: servicioPorDefecto,
  store: kvStorePersistente,
  recordatorios: servicioRecordatoriosExpo,
  ahora: () => new Date(),
  guardadosServidor: servicioEventosGuardados,
});
