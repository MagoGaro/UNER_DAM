import {
  aISOConZona,
  claveDia,
  desdeISO,
  etiquetaDiaCorta,
  formatearDuracion,
  formatearPrecio,
  proximosDias,
} from './fechas';

describe('fechas', () => {
  it('aISOConZona produce un ISO con zona que vuelve a la misma fecha', () => {
    const fecha = new Date(2026, 10, 14, 21, 5, 0);
    const iso = aISOConZona(fecha);
    expect(iso).toMatch(/^2026-11-14T21:05:00[+-]\d{2}:\d{2}$/);
    expect(desdeISO(iso)!.getTime()).toBe(fecha.getTime());
  });

  it('desdeISO no rompe con textos inválidos', () => {
    expect(desdeISO('no es una fecha')).toBeNull();
    expect(desdeISO(null)).toBeNull();
    expect(desdeISO('')).toBeNull();
  });

  it('proximosDias arranca por hoy', () => {
    const hoy = new Date(2026, 9, 22, 15, 30);
    const dias = proximosDias(hoy, 3);
    expect(dias.map(claveDia)).toEqual(['2026-10-22', '2026-10-23', '2026-10-24']);
  });

  it('etiquetaDiaCorta dice Hoy y Mañana', () => {
    const hoy = new Date(2026, 9, 22, 10);
    expect(etiquetaDiaCorta(new Date(2026, 9, 22), hoy).titulo).toBe('Hoy');
    expect(etiquetaDiaCorta(new Date(2026, 9, 23), hoy).titulo).toBe('Mañana');
    expect(etiquetaDiaCorta(new Date(2026, 9, 24), hoy).titulo).toBe('sáb');
  });

  it('formatearDuracion maneja horas, minutos y faltantes', () => {
    expect(formatearDuracion('2026-11-14T21:00:00-03:00', '2026-11-15T02:00:00-03:00')).toBe('5 h');
    expect(formatearDuracion('2026-11-14T21:00:00-03:00', '2026-11-14T21:45:00-03:00')).toBe('45 min');
    expect(formatearDuracion('2026-11-14T21:00:00-03:00', '2026-11-14T23:30:00-03:00')).toBe('2 h 30 min');
    expect(formatearDuracion('2026-11-14T21:00:00-03:00', null)).toBeNull();
  });

  it('formatearPrecio respeta 0 = gratis y null = no aplica', () => {
    expect(formatearPrecio(0)).toBe('Gratis');
    expect(formatearPrecio(null)).toBeNull();
    expect(formatearPrecio(1500)).toBe('$ 1.500');
  });
});
