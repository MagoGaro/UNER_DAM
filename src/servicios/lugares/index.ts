import { ServicioLugaresDePrueba } from './servicioLugaresDePrueba';
import type { ServicioLugares } from './ServicioLugares';

export type { ServicioLugares } from './ServicioLugares';
export { ServicioLugaresDePrueba } from './servicioLugaresDePrueba';

/**
 * Instancia por defecto que usan las pantallas. Cuando el Integrante 1
 * entregue el servicio real, esta es la única línea que hay que cambiar.
 */
export const servicioLugares: ServicioLugares = new ServicioLugaresDePrueba();
