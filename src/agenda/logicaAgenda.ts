import type { EstadoEvento, Evento } from '@/src/tipos/evento';
import { claveDia, desdeISO } from '@/src/utils/fechas';

/** Cuánto antes del inicio llega el recordatorio de un evento guardado. */
export const ANTICIPACION_RECORDATORIO_MINUTOS = 60;
/** Si el evento empieza antes de la anticipación, avisamos igual con este margen mínimo. */
export const ANTICIPACION_MINIMA_MINUTOS = 10;

/** Lo que recordamos de cada evento guardado para detectar cambios después. */
export interface EventoGuardado {
  id: string;
  titulo: string;
  inicioConocido: string;
  estadoConocido: EstadoEvento;
  notificacionId: string | null;
  guardadoEn: string;
}

/**
 * Estado que ve el turista: si un evento "programado" ya terminó (o, sin
 * hora de fin, empezó hace más de 3 horas), lo mostramos como finalizado
 * aunque el servidor todavía no lo haya actualizado.
 */
export function estadoVisible(evento: Evento, ahora: Date): EstadoEvento {
  if (evento.estado !== 'programado') return evento.estado;
  const inicio = desdeISO(evento.inicio);
  const fin = desdeISO(evento.fin);
  const limite = fin ?? (inicio ? new Date(inicio.getTime() + 3 * 3_600_000) : null);
  if (limite && limite.getTime() < ahora.getTime()) return 'finalizado';
  return 'programado';
}

export function estaVigente(estado: EstadoEvento): boolean {
  return estado === 'programado';
}

/** Eventos que empiezan el día `dia` (hora local), ordenados por hora de inicio. */
export function eventosDelDia(eventos: readonly Evento[], dia: Date): Evento[] {
  const clave = claveDia(dia);
  return eventos
    .filter((ev) => {
      const inicio = desdeISO(ev.inicio);
      return inicio !== null && claveDia(inicio) === clave;
    })
    .sort((a, b) => (desdeISO(a.inicio)!.getTime() - desdeISO(b.inicio)!.getTime()));
}

/** Cuántos eventos vigentes hay por día (para marcar los días en el selector). */
export function contarPorDia(eventos: readonly Evento[], ahora: Date): Record<string, number> {
  const cuenta: Record<string, number> = {};
  for (const ev of eventos) {
    const inicio = desdeISO(ev.inicio);
    if (!inicio || !estaVigente(estadoVisible(ev, ahora))) continue;
    const clave = claveDia(inicio);
    cuenta[clave] = (cuenta[clave] ?? 0) + 1;
  }
  return cuenta;
}

/**
 * Cuándo disparar el recordatorio: 60 min antes; si falta menos, 10 min
 * antes; si ya falta menos que eso (o ya empezó), no se programa.
 */
export function momentoRecordatorio(inicioISO: string, ahora: Date): Date | null {
  const inicio = desdeISO(inicioISO);
  if (!inicio) return null;
  const ideal = new Date(inicio.getTime() - ANTICIPACION_RECORDATORIO_MINUTOS * 60_000);
  if (ideal.getTime() > ahora.getTime()) return ideal;
  const minimo = new Date(inicio.getTime() - ANTICIPACION_MINIMA_MINUTOS * 60_000);
  if (minimo.getTime() > ahora.getTime()) return new Date(ahora.getTime() + 5_000);
  return null;
}

export type TipoCambio = 'suspendido' | 'cancelado' | 'reprogramado' | 'reactivado';

export interface CambioEvento {
  tipo: TipoCambio;
  evento: Evento;
  guardado: EventoGuardado;
}

/**
 * Compara lo que sabíamos de cada evento guardado con lo que trae ahora
 * la API y devuelve qué hay que avisarle al turista. Es lógica pura (sin
 * notificaciones ni almacenamiento) para poder testearla.
 */
export function detectarCambios(
  guardados: Record<string, EventoGuardado>,
  eventos: readonly Evento[]
): CambioEvento[] {
  const cambios: CambioEvento[] = [];
  for (const evento of eventos) {
    const guardado = guardados[evento.id];
    if (!guardado) continue;

    if (evento.estado !== guardado.estadoConocido) {
      if (evento.estado === 'suspendido' || evento.estado === 'cancelado') {
        cambios.push({ tipo: evento.estado, evento, guardado });
        continue;
      }
      if (evento.estado === 'programado') {
        cambios.push({ tipo: 'reactivado', evento, guardado });
        continue;
      }
    }

    if (evento.estado === 'programado' && evento.inicio !== guardado.inicioConocido) {
      cambios.push({ tipo: 'reprogramado', evento, guardado });
    }
  }
  return cambios;
}

export function textoCambio(cambio: CambioEvento): { titulo: string; cuerpo: string } {
  const nombre = cambio.evento.titulo;
  switch (cambio.tipo) {
    case 'suspendido':
      return { titulo: 'Evento suspendido', cuerpo: `«${nombre}» se suspendió. Revisá la agenda para ver novedades.` };
    case 'cancelado':
      return { titulo: 'Evento cancelado', cuerpo: `«${nombre}» se canceló.` };
    case 'reprogramado':
      return { titulo: 'Cambió el horario', cuerpo: `«${nombre}» cambió de horario. Te avisamos antes del nuevo inicio.` };
    case 'reactivado':
      return { titulo: 'Evento confirmado', cuerpo: `«${nombre}» vuelve a estar programado.` };
  }
}

export const ETIQUETAS_ESTADO: Record<EstadoEvento, { texto: string; color: string; fondo: string }> = {
  programado: { texto: 'Programado', color: '#1B5E20', fondo: '#E6F4EA' },
  suspendido: { texto: 'Suspendido', color: '#7A4100', fondo: '#FFE8CC' },
  cancelado: { texto: 'Cancelado', color: '#8B0000', fondo: '#FFE3E3' },
  finalizado: { texto: 'Finalizado', color: '#495057', fondo: '#E9ECEF' },
};
