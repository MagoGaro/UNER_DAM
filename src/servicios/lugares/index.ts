import { kvStorePersistente } from '@/src/almacenamiento/kvStore';
import { clienteApi } from '@/src/servicios/api';
import { ServicioLugaresApi } from './servicioLugaresApi';
import { ServicioLugaresConCache } from './servicioLugaresConCache';
import type { ServicioLugares } from './ServicioLugares';

export type { ServicioLugares } from './ServicioLugares';
export { ServicioLugaresConCache } from './servicioLugaresConCache';

/** Catálogo de la API, con copia en el teléfono para verlo sin señal. */
export const servicioLugares: ServicioLugares = new ServicioLugaresConCache(
  new ServicioLugaresApi(clienteApi),
  kvStorePersistente
);
