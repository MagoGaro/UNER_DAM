import { repositorioVisitas } from './repositorioVisitasLocal';
import { ServicioVisitasDePrueba } from './servicioVisitasDePrueba';
import type { ServicioVisitasApi } from './ServicioVisitasApi';

export type { RepositorioVisitas } from './RepositorioVisitas';
export type { ServicioVisitasApi } from './ServicioVisitasApi';
export { repositorioVisitas };

/** Única línea a cambiar cuando llegue la API real. */
export const servicioVisitasApi: ServicioVisitasApi = new ServicioVisitasDePrueba();
