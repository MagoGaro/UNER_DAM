import type { Lugar } from '../tipos/lugar';

export interface EstadoHorario {
  abierto: boolean;
  etiqueta: 'Abierto hoy' | 'Cierra pronto' | 'Cerrado hoy';
  color: string;
  mensaje: string;
}

export function evaluarEstadoHorario(
  lugar: Lugar,
  fecha: Date = new Date()
): EstadoHorario {
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

  const diaActual = fecha.getDay() as 0| 1 | 2 | 3 | 4 |5 |6; // 0 = Domingo, 1 = Lunes, ...
  const mesActual = fecha.getMonth() + 1; // 1 = Enero, ..., 12 = Diciembre
  const minutosActuales = fecha.getHours() * 60 + fecha.getMinutes();

  // Determinar temporada en Hemisferio Sur
  // Verano: Diciembre (12), Enero (1), Febrero (2), Marzo (3)
  const esVerano = [12, 1, 2, 3].includes(mesActual);
  const temporadaActual = esVerano ? 'Verano' : 'Invierno';

  // Buscar el horario correspondiente al día de hoy Y a la temporada vigente
  const horarioHoy = lugar.horarios.find((h) => {
    const coincideDia = h.dia === diaActual;
    const tempStr = h.temporada?.toLowerCase();
    const coincideTemporada =
      !tempStr || tempStr === 'todo_el_anio' || tempStr === 'todo_el_anio'|| tempStr === temporadaActual;
    return coincideDia && coincideTemporada;
  });

  // Si no hay horario configurado para hoy (ej. Lunes en el Molino Forclaz o Museos)
  if (!horarioHoy) {
    const esLunes = diaActual === 1;
    return {
      abierto: false,
      etiqueta: 'Cerrado hoy',
      color: '#E03131',
      mensaje: esLunes
        ? 'Cerrado hoy (cierre semanal de los lunes)'
        : 'Cerrado el día de hoy',
    };
  }

  const [hAbre, mAbre] = horarioHoy.abre.split(':').map(Number);
  const [hCierra, mCierra] = horarioHoy.cierra.split(':').map(Number);

  const minutosAbre = hAbre * 60 + mAbre;
  let minutosCierra = hCierra * 60 + mCierra;
  if (minutosCierra === 0) minutosCierra = 24 * 60;
  const esTemporadaVerano = horarioHoy.temporada?.toLowerCase() === 'verano';
  const textoTemporada = horarioHoy.temporada
    ? ` (${esTemporadaVerano ? 'Horario de verano' :'Horario de invierno'})`
    : '';

  // 1. Está dentro del horario de atención
  if (minutosActuales >= minutosAbre && minutosActuales < minutosCierra) {
    const quedanMinutos = minutosCierra - minutosActuales;
    if (quedanMinutos <= 30) {
      return {
        abierto: true,
        etiqueta: 'Cierra pronto',
        color: '#F59F00',
        mensaje: `Abierto hoy de ${horarioHoy.abre} a ${horarioHoy.cierra} hs${textoTemporada}`,
      };
    }
    return {
      abierto: true,
      etiqueta: 'Abierto hoy',
      color: '#2E9E4C',
      mensaje: `Abierto hoy de ${horarioHoy.abre} a ${horarioHoy.cierra} hs${textoTemporada}`,
    };
  }

  // 2. Aún no abrió hoy
  if (minutosActuales < minutosAbre) {
    return {
      abierto: false,
      etiqueta: 'Cerrado hoy',
      color: '#E03131',
      mensaje: `Cerrado ahora • Abre hoy a las ${horarioHoy.abre} hs${textoTemporada}`,
    };
  }

  // 3. Ya cerró por hoy
  return {
    abierto: false,
    etiqueta: 'Cerrado hoy',
    color: '#E03131',
    mensaje: `Cerrado por hoy (cerró a las ${horarioHoy.cierra} hs)`,
  };
}