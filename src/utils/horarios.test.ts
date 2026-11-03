import type { Horario, Lugar } from '@/src/tipos/lugar';
import { evaluarEstadoHorario, resumenSemanal } from './horarios';

function lugarCon(horarios: Horario[], extra: Partial<Lugar> = {}): Lugar {
  return {
    id: 'lug-x',
    nombre: 'Lugar de prueba',
    categoriaId: 'cat-museos',
    descripcionCorta: '',
    descripcion: '',
    direccion: '',
    imagenes: [],
    horarios,
    telefono: null,
    sitioWeb: null,
    precioEntrada: null,
    audioguia: null,
    codigoQr: null,
    accesible: true,
    activo: true,
    actualizadoEn: '2026-10-01T10:00:00-03:00',
    coordenadas: { latitud: -32.2, longitud: -58.1 },
    ...extra,
  };
}

// 22/10/2026 es jueves (dia 4); 14/01/2027 es jueves en verano.
const juevesOctubre = (h: number, m = 0) => new Date(2026, 9, 22, h, m);
const juevesEnero = (h: number, m = 0) => new Date(2027, 0, 14, h, m);

describe('evaluarEstadoHorario', () => {
  const termas: Horario[] = [
    { dia: 4, abre: '09:00', cierra: '21:00', temporada: 'Verano' },
    { dia: 4, abre: '09:00', cierra: '20:00', temporada: 'Invierno' },
  ];

  it('usa el horario de invierno en octubre (antes siempre daba cerrado)', () => {
    const estado = evaluarEstadoHorario(lugarCon(termas), juevesOctubre(10));
    expect(estado.abierto).toBe(true);
    expect(estado.mensaje).toContain('20:00');
  });

  it('usa el horario de verano en enero', () => {
    const estado = evaluarEstadoHorario(lugarCon(termas), juevesEnero(20, 30));
    expect(estado.abierto).toBe(true);
    expect(estado.mensaje).toContain('21:00');
  });

  it('a las 20:30 de octubre las termas ya cerraron', () => {
    expect(evaluarEstadoHorario(lugarCon(termas), juevesOctubre(20, 30)).abierto).toBe(false);
  });

  it('soporta dos franjas el mismo día (almuerzo y cena)', () => {
    const restaurante: Horario[] = [
      { dia: 4, abre: '12:00', cierra: '15:30' },
      { dia: 4, abre: '20:00', cierra: '00:30' },
    ];
    expect(evaluarEstadoHorario(lugarCon(restaurante), juevesOctubre(13)).abierto).toBe(true);
    const tarde = evaluarEstadoHorario(lugarCon(restaurante), juevesOctubre(17));
    expect(tarde.abierto).toBe(false);
    expect(tarde.mensaje).toContain('20:00');
    expect(evaluarEstadoHorario(lugarCon(restaurante), juevesOctubre(22)).abierto).toBe(true);
  });

  it('una franja que cierra después de medianoche sigue abierta a la madrugada', () => {
    const miercolesNoche: Horario[] = [{ dia: 3, abre: '20:00', cierra: '01:00' }];
    // jueves 00:20 → sigue abierta la franja del miércoles
    expect(evaluarEstadoHorario(lugarCon(miercolesNoche), juevesOctubre(0, 20)).abierto).toBe(true);
    expect(evaluarEstadoHorario(lugarCon(miercolesNoche), juevesOctubre(1, 10)).abierto).toBe(false);
  });

  it('avisa "cierra pronto" en los últimos 30 minutos', () => {
    const h: Horario[] = [{ dia: 4, abre: '09:00', cierra: '18:00' }];
    expect(evaluarEstadoHorario(lugarCon(h), juevesOctubre(17, 40)).etiqueta).toBe('Cierra pronto');
  });

  it('cerrado todo el día cuando no hay franja para hoy', () => {
    const h: Horario[] = [{ dia: 2, abre: '09:00', cierra: '18:00' }];
    const estado = evaluarEstadoHorario(lugarCon(h), juevesOctubre(10));
    expect(estado.abierto).toBe(false);
    expect(estado.mensaje).toBe('Cerrado el día de hoy');
  });

  it('un lugar dado de baja figura cerrado', () => {
    const h: Horario[] = [{ dia: 4, abre: '00:00', cierra: '23:59' }];
    expect(evaluarEstadoHorario(lugarCon(h, { activo: false }), juevesOctubre(10)).abierto).toBe(false);
  });
});

describe('resumenSemanal', () => {
  const h = (dia: Horario['dia'], abre: string, cierra: string, temporada?: Horario['temporada']): Horario => ({
    dia,
    abre,
    cierra,
    temporada,
  });

  it('junta los días seguidos con el mismo horario y marca los cerrados', () => {
    const horarios = [h(2, '09:00', '19:00'), h(3, '09:00', '19:00'), h(4, '09:00', '19:00'), h(6, '10:00', '20:00')];
    const [grupo] = resumenSemanal(horarios);
    expect(grupo.titulo).toBe('General');
    expect(grupo.lineas).toEqual([
      { dias: 'Lun', texto: 'Cerrado' },
      { dias: 'Mar a Jue', texto: '09:00 a 19:00 hs' },
      { dias: 'Vie', texto: 'Cerrado' },
      { dias: 'Sáb', texto: '10:00 a 20:00 hs' },
      { dias: 'Dom', texto: 'Cerrado' },
    ]);
  });

  it('un lugar que abre mañana y tarde muestra los dos tramos en orden', () => {
    const horarios = [1, 2, 3, 4, 5, 6, 0].flatMap((d) => [h(d as Horario['dia'], '16:00', '20:00'), h(d as Horario['dia'], '09:00', '13:00')]);
    const [grupo] = resumenSemanal(horarios);
    expect(grupo.lineas).toEqual([{ dias: 'Lun a Dom', texto: '09:00 a 13:00 hs y 16:00 a 20:00 hs' }]);
  });

  it('dos días seguidos se leen «Sáb y Dom» y un tramo que cruza la medianoche se muestra tal cual', () => {
    const [grupo] = resumenSemanal([h(6, '20:30', '01:00'), h(0, '20:30', '01:00')]);
    expect(grupo.lineas.at(-1)).toEqual({ dias: 'Sáb y Dom', texto: '20:30 a 01:00 hs' });
  });

  it('separa por temporada y no rompe sin horarios', () => {
    const grupos = resumenSemanal([h(1, '09:00', '18:00', 'Verano'), h(1, '10:00', '17:00', 'Invierno')]);
    expect(grupos.map((g) => g.titulo)).toEqual(['Verano', 'Invierno']);
    expect(resumenSemanal([])).toEqual([]);
  });
});
