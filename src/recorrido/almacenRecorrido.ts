import type { RepositorioVisitas } from '@/src/servicios/visitas/RepositorioVisitas';
import type { ServicioVisitasApi } from '@/src/servicios/visitas/ServicioVisitasApi';
import type { OrigenVisita, Visita } from '@/src/tipos/visita';
import { crearAlmacen } from '@/src/utils/almacen';
import { aISOConZona, claveDia, desdeISO } from '@/src/utils/fechas';
import { sincronizarPendientes, type ResultadoSincronizacion } from './sincronizador';

export const LARGO_MAXIMO_NOTA = 280;

export interface EstadoRecorrido {
  visitas: Visita[];
  cargado: boolean;
  errorAlCargar: boolean;
  sincronizando: boolean;
}

export interface DatosNuevaVisita {
  lugarId: string;
  origen: OrigenVisita;
  fotoUri: string | null;
  nota: string | null;
}

interface Dependencias {
  repo: RepositorioVisitas;
  api: ServicioVisitasApi;
  usuarioId: () => Promise<string>;
  hayConexion: () => Promise<boolean>;
  guardarFoto: (uriTemporal: string, visitaId: string) => string;
  borrarFoto: (uri: string | null) => void;
  ahora: () => Date;
}

function nuevoId(ahora: Date): string {
  return `vis-${ahora.getTime().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function limpiarNota(nota: string | null | undefined): string | null {
  const texto = (nota ?? '').trim().slice(0, LARGO_MAXIMO_NOTA);
  return texto.length ? texto : null;
}

export function crearRecorrido(deps: Dependencias) {
  const almacen = crearAlmacen<EstadoRecorrido>({ visitas: [], cargado: false, errorAlCargar: false, sincronizando: false });
  let sincronizacionEnCurso: Promise<ResultadoSincronizacion> | null = null;

  async function recargar() {
    try {
      const visitas = await deps.repo.listar();
      almacen.actualizar({ visitas, cargado: true, errorAlCargar: false });
    } catch {
      almacen.actualizar({ cargado: true, errorAlCargar: true });
    }
  }

  function sincronizar(): Promise<ResultadoSincronizacion> {
    if (sincronizacionEnCurso) return sincronizacionEnCurso;
    sincronizacionEnCurso = (async () => {
      almacen.actualizar({ sincronizando: true });
      try {
        const resultado = await sincronizarPendientes(deps.repo, deps.api, await deps.hayConexion());
        if (resultado.subidas > 0) await recargar();
        return resultado;
      } catch {
        return { subidas: 0, fallidas: 0, sinConexion: false };
      } finally {
        almacen.actualizar({ sincronizando: false });
        sincronizacionEnCurso = null;
      }
    })();
    return sincronizacionEnCurso;
  }

  /** Visita a ese lugar ya registrada hoy (para no duplicar si escanea dos veces). */
  function visitaDeHoy(lugarId: string): Visita | null {
    const hoy = claveDia(deps.ahora());
    return (
      almacen
        .obtener()
        .visitas.find((v) => v.lugarId === lugarId && desdeISO(v.fechaHora) && claveDia(desdeISO(v.fechaHora)!) === hoy) ?? null
    );
  }

  /** Guarda primero en el teléfono (funciona sin señal) y después intenta subir. */
  async function registrar(datos: DatosNuevaVisita): Promise<Visita> {
    const ahora = deps.ahora();
    const id = nuevoId(ahora);
    const visita: Visita = {
      id,
      usuarioId: await deps.usuarioId(),
      lugarId: datos.lugarId,
      fechaHora: aISOConZona(ahora),
      origen: datos.origen,
      fotoUri: datos.fotoUri ? deps.guardarFoto(datos.fotoUri, id) : null,
      nota: limpiarNota(datos.nota),
      sincronizada: false,
    };
    await deps.repo.guardar(visita);
    almacen.actualizar((p) => ({ visitas: [...p.visitas, visita].sort((a, b) => a.fechaHora.localeCompare(b.fechaHora)) }));
    sincronizar(); // en segundo plano
    return visita;
  }

  /** Cambiar nota o foto: vuelve a quedar pendiente de subir. */
  async function editar(id: string, cambios: { nota?: string | null; fotoUri?: string | null }) {
    const actual = almacen.obtener().visitas.find((v) => v.id === id);
    if (!actual) return;
    const parcial: Partial<Visita> = { sincronizada: false };
    if ('nota' in cambios) parcial.nota = limpiarNota(cambios.nota);
    if ('fotoUri' in cambios) {
      parcial.fotoUri = cambios.fotoUri ? deps.guardarFoto(cambios.fotoUri, id) : null;
      if (actual.fotoUri && actual.fotoUri !== parcial.fotoUri) deps.borrarFoto(actual.fotoUri);
    }
    await deps.repo.actualizar(id, parcial);
    almacen.actualizar((p) => ({ visitas: p.visitas.map((v) => (v.id === id ? { ...v, ...parcial } : v)) }));
    sincronizar();
  }

  async function eliminar(id: string) {
    const actual = almacen.obtener().visitas.find((v) => v.id === id);
    await deps.repo.eliminar(id);
    deps.borrarFoto(actual?.fotoUri ?? null);
    almacen.actualizar((p) => ({ visitas: p.visitas.filter((v) => v.id !== id) }));
    if (actual?.sincronizada) deps.api.eliminarVisita(id).catch(() => {});
  }

  return { almacen, recargar, sincronizar, registrar, editar, eliminar, visitaDeHoy };
}

export type Recorrido = ReturnType<typeof crearRecorrido>;
