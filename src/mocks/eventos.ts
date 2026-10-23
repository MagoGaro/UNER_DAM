import type { Evento } from '@/src/tipos/evento';
import { aISOConZona, inicioDelDia } from '@/src/utils/fechas';

/**
 * Datos inventados de la agenda, tipados con `Evento` (si no compila
 * contra el tipo, está mal el mock). Las fechas se arman *relativas a
 * hoy* para que la agenda nunca quede vacía cuando se prueba la app en
 * otra fecha; igual viajan como texto ISO con zona, como la API real.
 *
 * Incluye a propósito los casos feos que pide el documento: evento
 * suspendido por lluvia, cancelado, finalizado, sin imagen, sin hora de
 * fin, con dirección suelta (con y sin coordenadas), asociado a un lugar
 * que ya no existe y un texto larguísimo.
 */
function en(dias: number, hora: number, minuto = 0, base: Date = new Date()): string {
  const d = inicioDelDia(base);
  d.setDate(d.getDate() + dias);
  d.setHours(hora, minuto, 0, 0);
  return aISOConZona(d);
}

export function crearEventosDePrueba(hoy: Date = new Date()): Evento[] {
  const e = (dias: number, hora: number, minuto = 0) => en(dias, hora, minuto, hoy);
  return [
    {
      id: 'evt-001',
      titulo: 'Visita guiada por la costanera',
      descripcion:
        'Recorrido a pie de una hora y media por la costanera y el puerto viejo con una guía de la Dirección de Turismo. Sale desde el Centro de Informes, no hace falta inscribirse.',
      lugarId: 'lug-014',
      direccionLibre: null,
      coordenadas: null,
      inicio: e(0, 17, 0),
      fin: e(0, 18, 30),
      imagenUrl: 'https://picsum.photos/seed/costanera/800/450',
      precio: 0,
      estado: 'programado',
    },
    {
      id: 'evt-002',
      titulo: 'Feria de artesanos: noche de luthiers',
      descripcion: 'Los luthiers de la feria muestran cómo se arma una guitarra criolla. Hay música en vivo.',
      lugarId: 'lug-009',
      direccionLibre: null,
      coordenadas: null,
      inicio: e(0, 20, 30),
      fin: e(0, 23, 0),
      imagenUrl: 'https://picsum.photos/seed/feria/800/450',
      precio: 0,
      estado: 'programado',
    },
    {
      id: 'evt-003',
      titulo: 'Clase abierta de aquagym en las termas',
      descripcion: 'Actividad incluida con la entrada a las termas. Traé gorra de baño.',
      lugarId: 'lug-001',
      direccionLibre: null,
      coordenadas: null,
      inicio: e(0, 10, 0),
      fin: e(0, 11, 0),
      imagenUrl: null, // caso feo: sin imagen
      precio: 6000,
      estado: 'finalizado',
    },
    {
      id: 'evt-017',
      titulo: 'Peña en el anfiteatro',
      descripcion: 'Noche de folclore con artistas de la región.',
      lugarId: null,
      direccionLibre: 'Anfiteatro Municipal Juan Pablo II, Costanera Norte',
      coordenadas: { latitud: -32.2155, longitud: -58.1318 },
      inicio: e(1, 21, 0),
      fin: e(2, 2, 0), // cruza la medianoche
      imagenUrl: 'https://picsum.photos/seed/pena/800/450',
      precio: 0,
      estado: 'programado',
    },
    {
      id: 'evt-004',
      titulo: 'Avistaje de aves en El Palmar',
      descripcion:
        'Salida con guardaparques para ver aves del palmar al amanecer. Llevar binoculares si tenés, agua y repelente. Dentro del parque casi no hay señal: guardá el evento antes de ir.',
      lugarId: 'lug-007',
      direccionLibre: null,
      coordenadas: null,
      inicio: e(1, 6, 30),
      fin: e(1, 9, 30),
      imagenUrl: 'https://picsum.photos/seed/aves/800/450',
      precio: 2500,
      estado: 'suspendido', // caso feo: suspendido por lluvia
    },
    {
      id: 'evt-005',
      titulo: 'Visita nocturna teatralizada al Molino Forclaz',
      descripcion: 'Actores recrean la llegada de los colonos suizos en 1857. Cupos limitados por orden de llegada.',
      lugarId: 'lug-004',
      direccionLibre: null,
      coordenadas: null,
      inicio: e(2, 20, 0),
      fin: e(2, 21, 30),
      imagenUrl: 'https://picsum.photos/seed/molino/800/450',
      precio: 1500,
      estado: 'programado',
    },
    {
      id: 'evt-006',
      titulo: 'Recital en la playa',
      descripcion: 'Bandas locales en un escenario sobre la arena.',
      lugarId: null,
      direccionLibre: 'Playa Norte, frente al parador Los Sauces',
      coordenadas: null, // caso feo: dirección suelta sin coordenadas
      inicio: e(3, 19, 0),
      fin: null, // caso feo: sin hora de fin
      imagenUrl: null,
      precio: null, // caso feo: precio no informado
      estado: 'cancelado',
    },
    {
      id: 'evt-007',
      titulo:
        'Fiesta Nacional de la Artesanía — Gran desfile de apertura con delegaciones de todas las provincias del país y artesanos invitados de Uruguay, Brasil y Paraguay',
      descripcion:
        'La Fiesta Nacional de la Artesanía es el evento más convocante del año en Colón. Durante nueve noches el Parque Quirós se llena de stands de artesanos seleccionados de todo el país, con espectáculos musicales en el escenario mayor, patio de comidas regionales y talleres abiertos para chicos. El desfile de apertura recorre la avenida 12 de Abril desde la plaza San Martín hasta el parque. Se recomienda llegar temprano: las calles cercanas se cortan desde las 18 horas y el estacionamiento es limitado. Hay sector accesible para personas con movilidad reducida junto al escenario. La entrada al predio tiene un bono contribución que se destina a las escuelas de la ciudad. '.repeat(
          2
        ), // caso feo: texto larguísimo
      lugarId: null,
      direccionLibre: 'Parque Quirós, Colón',
      coordenadas: { latitud: -32.2178, longitud: -58.1301 },
      inicio: e(4, 19, 30),
      fin: e(5, 1, 0),
      imagenUrl: 'https://picsum.photos/seed/artesania/800/450',
      precio: 2000,
      estado: 'programado',
    },
    {
      id: 'evt-008',
      titulo: 'Charla en un lugar dado de baja',
      descripcion: 'Evento asociado a un lugar que ya no está en el catálogo: la app no debe romperse.',
      lugarId: 'lug-099', // caso feo: lugar inexistente
      direccionLibre: null,
      coordenadas: null,
      inicio: e(5, 18, 0),
      fin: e(5, 19, 0),
      imagenUrl: null,
      precio: 0,
      estado: 'programado',
    },
    {
      id: 'evt-009',
      titulo: 'Atardecer con música en el mirador',
      descripcion: 'DJ set acústico mientras cae el sol sobre el río Uruguay.',
      lugarId: 'lug-013',
      direccionLibre: null,
      coordenadas: null,
      inicio: e(6, 18, 30),
      fin: e(6, 20, 30),
      imagenUrl: 'https://picsum.photos/seed/mirador/800/450',
      precio: 0,
      estado: 'programado',
    },
    {
      id: 'evt-010',
      titulo: 'Degustación en Bodega Vulliez Sermet',
      descripcion: 'Cata guiada de tres vinos de la casa con quesos de la colonia.',
      lugarId: 'lug-008',
      direccionLibre: null,
      coordenadas: null,
      inicio: e(9, 11, 0),
      fin: e(9, 13, 0),
      imagenUrl: 'https://picsum.photos/seed/bodega/800/450',
      precio: 4000,
      estado: 'programado',
    },
    {
      id: 'evt-000',
      titulo: 'Evento de ayer',
      descripcion: 'Ya pasó: no tiene que aparecer en la agenda que empieza por hoy.',
      lugarId: 'lug-012',
      direccionLibre: null,
      coordenadas: null,
      inicio: e(-1, 18, 0),
      fin: e(-1, 19, 0),
      imagenUrl: null,
      precio: 0,
      estado: 'finalizado',
    },
  ];
}
