import { kvStorePersistente } from '@/src/almacenamiento/kvStore';
import { ServicioLugaresConCache } from './servicioLugaresConCache';
import { ServicioLugaresDePrueba } from './servicioLugaresDePrueba';
import type { ServicioLugares } from './ServicioLugares';

export type { ServicioLugares } from './ServicioLugares';
export { ServicioLugaresDePrueba } from './servicioLugaresDePrueba';
export { ServicioLugaresConCache } from './servicioLugaresConCache';

/**
 * Instancia por defecto que usan las pantallas. Cuando llegue la API real,
 * se reemplaza solo `new ServicioLugaresDePrueba()` por el servicio con
 * `fetch`: el caché para usar sin señal ya queda puesto alrededor.
 */
export const servicioLugares: ServicioLugares = new ServicioLugaresConCache(
  new ServicioLugaresDePrueba(),
  kvStorePersistente
);
