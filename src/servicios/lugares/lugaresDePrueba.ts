import type { Lugar } from '@/src/tipos/lugar';

/**
 * Datos de prueba con coordenadas reales de Colón, Entre Ríos (acuerdo
 * pendiente con Integrante 1: "5-6 lugares de prueba con coordenadas
 * reales de Colón"). Incluye un lugar lejano (Parque Nacional El Palmar)
 * para poder probar la flecha de orientación y el caso "sin señal", y un
 * lugar inactivo para probar que se filtra del mapa y de la lista.
 * `imagenUrl`/`calificacion`/`descripcionCorta` son solo para que la
 * tarjeta de «Cerca tuyo» tenga contenido de muestra; se reemplazan
 * cuando el Integrante 1 entregue el catálogo real.
 * Reemplazar por `listarLugares()` del servicio real cuando esté listo:
 * ver src/servicios/lugares/servicioLugaresDePrueba.ts.
 */
export const LUGARES_DE_PRUEBA: readonly Lugar[] = [
  {
    id: 'lug-001',
    nombre: 'Plaza San Martín',
    categoria: 'monumento',
    coordenadas: { latitud: -32.2241, longitud: -58.1419 },
    activo: true,
    imagenUrl: 'https://picsum.photos/seed/plaza-san-martin/400/300',
    calificacion: 4.3,
    descripcionCorta: 'El centro de la ciudad, a dos cuadras de la costanera.',
  },
  {
    id: 'lug-002',
    nombre: 'Costanera de Colón',
    categoria: 'mirador',
    coordenadas: { latitud: -32.22, longitud: -58.135 },
    activo: true,
    imagenUrl: 'https://picsum.photos/seed/costanera-colon/400/300',
    calificacion: 4.6,
    descripcionCorta: 'Paseo costero sobre el río Uruguay, ideal para caminar.',
  },
  {
    id: 'lug-003',
    nombre: 'Complejo Termal Colón',
    categoria: 'termas',
    coordenadas: { latitud: -32.234, longitud: -58.147 },
    activo: true,
    imagenUrl: 'https://picsum.photos/seed/termas-colon/400/300',
    calificacion: 4.0,
    descripcionCorta: 'Piletas termales de distintas temperaturas.',
  },
  {
    id: 'lug-004',
    nombre: 'Puente Internacional Colón–Paysandú',
    categoria: 'monumento',
    coordenadas: { latitud: -32.192, longitud: -58.128 },
    activo: true,
    imagenUrl: 'https://picsum.photos/seed/puente-colon/400/300',
    calificacion: 4.1,
    descripcionCorta: 'Cruce internacional sobre el río Uruguay hacia Uruguay.',
  },
  {
    id: 'lug-005',
    nombre: 'Parador La Costanera',
    categoria: 'restaurante',
    coordenadas: { latitud: -32.2215, longitud: -58.1365 },
    activo: true,
    imagenUrl: 'https://picsum.photos/seed/parador-costanera/400/300',
    calificacion: 4.4,
    descripcionCorta: 'Cocina de río frente al agua.',
  },
  {
    id: 'lug-006',
    nombre: 'Cabañas del Río',
    categoria: 'alojamiento',
    coordenadas: { latitud: -32.228, longitud: -58.149 },
    activo: true,
    imagenUrl: 'https://picsum.photos/seed/cabanas-rio/400/300',
    calificacion: 4.5,
    descripcionCorta: 'Cabañas con parque y pileta, a metros del río.',
  },
  {
    id: 'lug-007',
    nombre: 'Parque Nacional El Palmar',
    categoria: 'mirador',
    coordenadas: { latitud: -31.85306, longitud: -58.3225 },
    activo: true,
    imagenUrl: 'https://picsum.photos/seed/palmar/400/300',
    calificacion: 4.8,
    descripcionCorta: 'Uno de los últimos palmares de yatay del país.',
  },
  {
    id: 'lug-008',
    nombre: 'Antiguo Balneario Norte (cerrado)',
    categoria: 'playa',
    coordenadas: { latitud: -32.216, longitud: -58.133 },
    activo: false,
  },
  {
    id: 'lug-009',
    nombre: 'Playa Sur',
    categoria: 'playa',
    coordenadas: { latitud: -32.2265, longitud: -58.1405 },
    activo: true,
    imagenUrl: 'https://picsum.photos/seed/playa-sur/400/300',
    calificacion: 4.2,
    descripcionCorta: 'Playa de arena con acceso peatonal desde el centro.',
  },
  {
    id: 'lug-010',
    nombre: 'Museo Histórico Regional',
    categoria: 'museo',
    coordenadas: { latitud: -32.2255, longitud: -58.1435 },
    activo: true,
    imagenUrl: 'https://picsum.photos/seed/museo-colon/400/300',
    calificacion: 4.0,
    descripcionCorta: 'Historia de Colón desde la fundación hasta hoy.',
  },
] as const;
