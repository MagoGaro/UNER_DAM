import type { Horario, Lugar } from '../tipos/lugar';

export interface EstadoHorario {
  abierto: boolean;
  etiqueta: 'Abierto hoy' | 'Cierra pronto' | 'Cerrado hoy';
  color: string;
  mensaje: string;
}

type Dia = Horario['dia'];

const MINUTOS_DIA = 24 * 60;

/** Verano en el hemisferio sur según el catálogo: diciembre a marzo. */
export function temporadaDe(fecha: Date): 'verano' | 'invierno' {
  return [12, 1, 2, 3].includes(fecha.getMonth() + 1) ? 'verano' : 'invierno';
}

function aMinutos(hhmm: string): number | null {
  const [h, m] = hhmm.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

/**
 * Antes se comparaba `temporada.toLowerCase()` ('verano') contra 'Verano'
 * y nunca coincidía: las Termas (único lugar con temporadas) figuraban
 * siempre "Cerrado". Ahora la comparación es insensible a mayúsculas.
 */
function vigenteEnTemporada(h: Horario, temporada: 'verano' | 'invierno'): boolean {
  const t = h.temporada?.toLowerCase();
  return !t || t === 'todo_el_anio' || t === temporada;
}

interface Franja {
  horario: Horario;
  /** Minutos desde las 00:00 del día evaluado (pueden pasar de 1440 si cruza medianoche). */
  desde: number;
  hasta: number;
}

/** Franjas que abren hoy, más la de ayer que cruza la medianoche (ej. 20:00 → 00:30). */
function franjasDelDia(horarios: Horario[], fecha: Date): Franja[] {
  const temporada = temporadaDe(fecha);
  const hoy = fecha.getDay() as Dia;
  const ayer = ((hoy + 6) % 7) as Dia;
  const franjas: Franja[] = [];

  for (const h of horarios) {
    if (!vigenteEnTemporada(h, temporada)) continue;
    const abre = aMinutos(h.abre);
    const cierraBase = aMinutos(h.cierra);
    if (abre === null || cierraBase === null) continue;
    // "00:00" o cualquier cierre <= apertura significa que cierra al día siguiente.
    const cierra = cierraBase <= abre ? cierraBase + MINUTOS_DIA : cierraBase;

    if (h.dia === hoy) franjas.push({ horario: h, desde: abre, hasta: cierra });
    if (h.dia === ayer && cierra > MINUTOS_DIA) {
      franjas.push({ horario: h, desde: abre - MINUTOS_DIA, hasta: cierra - MINUTOS_DIA });
    }
  }
  return franjas.sort((a, b) => a.desde - b.desde);
}

function textoTemporada(h: Horario): string {
  const t = h.temporada?.toLowerCase();
  if (t === 'verano') return ' (Horario de verano)';
  if (t === 'invierno') return ' (Horario de invierno)';
  return '';
}

export function evaluarEstadoHorario(lugar: Lugar, fecha: Date = new Date()): EstadoHorario {
  if (!lugar.activo) {
    return {
      abierto: false,
      etiqueta: 'Cerrado hoy',
      color: '#E03131',
      mensaje: 'Lugar cerrado temporalmente',
    };
  }

  if (!lugar.horarios || lugar.horarios.length === 0) {
    return {
      abierto: false,
      etiqueta: 'Cerrado hoy',
      color: '#6C757D',
      mensaje: 'Sin horarios registrados',
    };
  }

  const ahora = fecha.getHours() * 60 + fecha.getMinutes();
  const franjas = franjasDelDia(lugar.horarios, fecha);

  // 1. ¿Hay alguna franja abierta ahora? (soporta varias franjas: almuerzo y cena)
  const abierta = franjas.find((f) => ahora >= f.desde && ahora < f.hasta);
  if (abierta) {
    const mensaje = `Abierto ahora · cierra ${abierta.horario.cierra} hs${textoTemporada(abierta.horario)}`;
    if (abierta.hasta - ahora <= 30) {
      return { abierto: true, etiqueta: 'Cierra pronto', color: '#F59F00', mensaje };
    }
    return { abierto: true, etiqueta: 'Abierto hoy', color: '#2E9E4C', mensaje };
  }

  // 2. Abre más tarde hoy
  const proxima = franjas.find((f) => f.desde > ahora && f.desde < MINUTOS_DIA);
  if (proxima) {
    return {
      abierto: false,
      etiqueta: 'Cerrado hoy',
      color: '#E03131',
      mensaje: `Cerrado ahora · abre hoy a las ${proxima.horario.abre} hs${textoTemporada(proxima.horario)}`,
    };
  }

  // 3. Hoy no abre (ej. lunes en el Molino Forclaz)
  const abreHoy = franjas.some((f) => f.desde >= 0);
  if (!abreHoy) {
    return {
      abierto: false,
      etiqueta: 'Cerrado hoy',
      color: '#E03131',
      mensaje: fecha.getDay() === 1 ? 'Cerrado hoy (cierre semanal de los lunes)' : 'Cerrado el día de hoy',
    };
  }

  // 4. Ya cerró por hoy
  const ultima = franjas.filter((f) => f.desde >= 0).at(-1)!;
  return {
    abierto: false,
    etiqueta: 'Cerrado hoy',
    color: '#E03131',
    mensaje: `Cerrado por hoy (cerró a las ${ultima.horario.cierra} hs)`,
  };
}
