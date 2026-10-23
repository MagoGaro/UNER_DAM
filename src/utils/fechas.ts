/**
 * Utilidades de fecha. Regla del pedido: las fechas viajan como texto ISO
 * 8601 con zona y recién se convierten a `Date` al mostrar. Todo lo que
 * sigue recibe/devuelve strings ISO o `Date` locales del teléfono.
 */

const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'] as const;
const DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'] as const;
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] as const;
const MESES_LARGOS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
] as const;

const dosDigitos = (n: number) => String(n).padStart(2, '0');

/** `Date` → "2026-11-14T21:00:00-03:00" usando la zona horaria del teléfono. */
export function aISOConZona(fecha: Date): string {
  const desfaseMin = -fecha.getTimezoneOffset();
  const signo = desfaseMin >= 0 ? '+' : '-';
  const abs = Math.abs(desfaseMin);
  return (
    `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}` +
    `T${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}:${dosDigitos(fecha.getSeconds())}` +
    `${signo}${dosDigitos(Math.floor(abs / 60))}:${dosDigitos(abs % 60)}`
  );
}

/** Parsea un ISO con zona. Devuelve null si el texto no es una fecha válida (nunca tira). */
export function desdeISO(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/** "2026-11-14" del día local del teléfono: sirve como clave para agrupar por día. */
export function claveDia(fecha: Date): string {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

export function inicioDelDia(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0, 0);
}

export function sumarDias(fecha: Date, dias: number): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias, fecha.getHours(), fecha.getMinutes());
}

/** Los próximos `cantidad` días empezando por hoy (a las 00:00 locales). */
export function proximosDias(hoy: Date, cantidad: number): Date[] {
  const base = inicioDelDia(hoy);
  return Array.from({ length: cantidad }, (_, i) => sumarDias(base, i));
}

/** "jueves 22 de octubre" → "Jueves 22 de octubre" (solo la primera letra). */
export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** "21:00" */
export function formatearHora(fecha: Date): string {
  return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

/** "Hoy", "Mañana" o "vie 24". */
export function etiquetaDiaCorta(dia: Date, hoy: Date): { titulo: string; subtitulo: string } {
  const diferencia = Math.round(
    (inicioDelDia(dia).getTime() - inicioDelDia(hoy).getTime()) / 86_400_000
  );
  const numero = `${dia.getDate()} ${MESES_CORTOS[dia.getMonth()]}`;
  if (diferencia === 0) return { titulo: 'Hoy', subtitulo: numero };
  if (diferencia === 1) return { titulo: 'Mañana', subtitulo: numero };
  return { titulo: DIAS_CORTOS[dia.getDay()], subtitulo: numero };
}

/** "sábado 14 de noviembre" */
export function formatearDiaLargo(fecha: Date): string {
  return `${DIAS_LARGOS[fecha.getDay()]} ${fecha.getDate()} de ${MESES_LARGOS[fecha.getMonth()]}`;
}

/** "Hoy", "Ayer" o "sábado 14 de noviembre": encabezado de cada día en Mi recorrido. */
export function formatearDiaRelativo(fecha: Date, hoy: Date): string {
  const diferencia = Math.round(
    (inicioDelDia(hoy).getTime() - inicioDelDia(fecha).getTime()) / 86_400_000
  );
  if (diferencia === 0) return 'Hoy';
  if (diferencia === 1) return 'Ayer';
  const texto = formatearDiaLargo(fecha);
  return fecha.getFullYear() === hoy.getFullYear() ? texto : `${texto} de ${fecha.getFullYear()}`;
}

/** Duración legible entre dos ISO: "45 min", "2 h", "5 h 30 min". null si falta el fin o es inválido. */
export function formatearDuracion(inicioISO: string, finISO: string | null): string | null {
  const inicio = desdeISO(inicioISO);
  const fin = desdeISO(finISO);
  if (!inicio || !fin) return null;
  const minutos = Math.round((fin.getTime() - inicio.getTime()) / 60_000);
  if (minutos <= 0) return null;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto} min`;
  if (resto === 0) return `${horas} h`;
  return `${horas} h ${resto} min`;
}

/** "Gratis", "$ 1.500" o null cuando el precio no aplica. */
export function formatearPrecio(precio: number | null): string | null {
  if (precio === null) return null;
  if (precio === 0) return 'Gratis';
  return `$ ${Math.round(precio).toLocaleString('es-AR').replace(/,/g, '.')}`;
}
