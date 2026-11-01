import { crearEventosDePrueba } from '@/src/mocks/eventos';
import type { Evento } from '@/src/tipos/evento';
import {
  contarPorDia,
  detectarCambios,
  estadoVisible,
  eventosDelDia,
  momentoRecordatorio,
  type EventoGuardado,
} from './logicaAgenda';

const base: Evento = {
  id: 'evt-1',
  titulo: 'Peña',
  descripcion: '',
  lugarId: null,
  direccionLibre: 'Costanera',
  coordenadas: null,
  inicio: '2026-11-14T21:00:00-03:00',
  fin: '2026-11-15T02:00:00-03:00',
  imagenUrl: null,
  precio: 0,
  estado: 'programado',
};

const guardado = (extra: Partial<EventoGuardado> = {}): EventoGuardado => ({
  id: 'evt-1',
  titulo: 'Peña',
  inicioConocido: base.inicio,
  estadoConocido: 'programado',
  notificacionId: 'notif-1',
  guardadoEn: '2026-11-10T10:00:00-03:00',
  ...extra,
});

describe('agenda', () => {
  it('los mocks compilan contra el tipo y tienen eventos para hoy', () => {
    const hoy = new Date();
    expect(eventosDelDia(crearEventosDePrueba(hoy), hoy).length).toBeGreaterThan(0);
  });

  it('eventosDelDia ordena por hora y filtra por día local', () => {
    const hoy = new Date(2026, 9, 22, 8);
    const eventos = crearEventosDePrueba(hoy);
    const deHoy = eventosDelDia(eventos, hoy);
    const horas = deHoy.map((e) => new Date(e.inicio).getTime());
    expect([...horas].sort((a, b) => a - b)).toEqual(horas);
    expect(deHoy.find((e) => e.id === 'evt-000')).toBeUndefined(); // el de ayer no aparece
  });

  it('estadoVisible marca finalizado un programado que ya terminó', () => {
    expect(estadoVisible(base, new Date('2026-11-15T03:00:00-03:00'))).toBe('finalizado');
    expect(estadoVisible(base, new Date('2026-11-14T22:00:00-03:00'))).toBe('programado');
    expect(estadoVisible({ ...base, estado: 'suspendido' }, new Date('2026-11-14T10:00:00-03:00'))).toBe('suspendido');
  });

  it('contarPorDia ignora cancelados y suspendidos', () => {
    const ahora = new Date('2026-11-14T10:00:00-03:00');
    const cuenta = contarPorDia([base, { ...base, id: 'x', estado: 'cancelado' }], ahora);
    expect(Object.values(cuenta)).toEqual([1]);
  });

  it('momentoRecordatorio: 60 min antes, o casi ya si falta poco, o nada si ya empezó', () => {
    const lejos = momentoRecordatorio(base.inicio, new Date('2026-11-14T10:00:00-03:00'));
    expect(lejos?.toISOString()).toBe(new Date('2026-11-14T20:00:00-03:00').toISOString());
    expect(momentoRecordatorio(base.inicio, new Date('2026-11-14T20:30:00-03:00'))).not.toBeNull();
    expect(momentoRecordatorio(base.inicio, new Date('2026-11-14T20:55:00-03:00'))).toBeNull();
    expect(momentoRecordatorio('fecha rota', new Date())).toBeNull();
  });

  it('detectarCambios avisa suspensión, cancelación y cambio de horario solo de los guardados', () => {
    const guardados = { 'evt-1': guardado() };
    expect(detectarCambios(guardados, [{ ...base, estado: 'suspendido' }])[0].tipo).toBe('suspendido');
    expect(detectarCambios(guardados, [{ ...base, estado: 'cancelado' }])[0].tipo).toBe('cancelado');
    expect(detectarCambios(guardados, [{ ...base, inicio: '2026-11-14T22:00:00-03:00' }])[0].tipo).toBe('reprogramado');
    expect(detectarCambios(guardados, [base])).toEqual([]);
    expect(detectarCambios({}, [{ ...base, estado: 'cancelado' }])).toEqual([]);
  });

  it('detectarCambios avisa cuando un suspendido vuelve a estar programado', () => {
    const guardados = { 'evt-1': guardado({ estadoConocido: 'suspendido' }) };
    expect(detectarCambios(guardados, [base])[0].tipo).toBe('reactivado');
  });
});
