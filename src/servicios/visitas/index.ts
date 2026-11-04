import { clienteApi } from '@/src/servicios/api';
import { repositorioVisitas } from './repositorioVisitasLocal';
import { ServicioVisitasHttp } from './servicioVisitasHttp';
import type { ServicioVisitasApi } from './ServicioVisitasApi';

export type { RepositorioVisitas } from './RepositorioVisitas';
export type { ServicioVisitasApi } from './ServicioVisitasApi';
export { repositorioVisitas };

export const servicioVisitasApi: ServicioVisitasApi = new ServicioVisitasHttp(clienteApi);
