import type { Lugar } from '@/src/tipos/lugar';

/**
 * Datos de prueba con coordenadas reales de Colón, Entre Ríos (acuerdo
 * pendiente con Integrante 1: "5-6 lugares de prueba con coordenadas
 * reales de Colón"). Incluye un lugar lejano (Parque Nacional El Palmar)
 * para poder probar la flecha de orientación y el caso "sin señal", y un
 * lugar inactivo para probar que se filtra del mapa y de la lista.
 * Reemplazar por `listarLugares()` del servicio real cuando esté listo:
 * ver src/servicios/lugares/servicioLugaresDePrueba.ts.
 */
export const LUGARES_DE_PRUEBA: readonly Lugar[] = [
  {
    id: 'lug-001',
    nombre: 'Plaza San Martín',
    categoria: 'plaza',
    coordenadas: { latitud: -32.2241, longitud: -58.1419 },
    activo: true,
  },
  {
    id: 'lug-002',
    nombre: 'Costanera de Colón',
    categoria: 'mirador',
    coordenadas: { latitud: -32.22, longitud: -58.135 },
    activo: true,
  },
  {
    id: 'lug-003',
    nombre: 'Complejo Termal Colón',
    categoria: 'otro',
    coordenadas: { latitud: -32.234, longitud: -58.147 },
    activo: true,
  },
  {
    id: 'lug-004',
    nombre: 'Puente Internacional Colón–Paysandú',
    categoria: 'monumento',
    coordenadas: { latitud: -32.192, longitud: -58.128 },
    activo: true,
  },
  {
    id: 'lug-005',
    nombre: 'Parador La Costanera',
    categoria: 'restaurante',
    coordenadas: { latitud: -32.2215, longitud: -58.1365 },
    activo: true,
  },
  {
    id: 'lug-006',
    nombre: 'Cabañas del Río',
    categoria: 'alojamiento',
    coordenadas: { latitud: -32.228, longitud: -58.149 },
    activo: true,
  },
  {
    id: 'lug-007',
    nombre: 'Parque Nacional El Palmar',
    categoria: 'mirador',
    coordenadas: { latitud: -31.85306, longitud: -58.3225 },
    activo: true,
  },
  {
    id: 'lug-008',
    nombre: 'Antiguo Balneario Norte (cerrado)',
    categoria: 'otro',
    coordenadas: { latitud: -32.216, longitud: -58.133 },
    activo: false,
  },
];
