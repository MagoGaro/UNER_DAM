import { kvStorePersistente } from '@/src/almacenamiento/kvStore';
import { clienteApi } from '@/src/servicios/api';
import { ServicioLugaresApi } from './servicioLugaresApi';
import { ServicioLugaresConCache } from './servicioLugaresConCache';
import { ServicioLugaresDePrueba } from './servicioLugaresDePrueba';
import type { ServicioLugares } from './ServicioLugares';

export type { ServicioLugares } from './ServicioLugares';
export { ServicioLugaresDePrueba } from './servicioLugaresDePrueba';
export { ServicioLugaresConCache } from './servicioLugaresConCache';

/**
 * Instancia por defecto que usan las pantallas: la API real si hay
 * `EXPO_PUBLIC_API_URL` y, si no, los datos de prueba. En los dos casos
 * con el caché para usar sin señal alrededor.
 */
export const servicioLugares: ServicioLugares = new ServicioLugaresConCache(
  clienteApi ? new ServicioLugaresApi(clienteApi) : new ServicioLugaresDePrueba(),
  kvStorePersistente
);
