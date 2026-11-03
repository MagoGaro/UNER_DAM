import { clienteApi } from '@/src/servicios/api';
import { repositorioVisitas } from './repositorioVisitasLocal';
import { ServicioVisitasDePrueba } from './servicioVisitasDePrueba';
import { ServicioVisitasHttp } from './servicioVisitasHttp';
import type { ServicioVisitasApi } from './ServicioVisitasApi';

export type { RepositorioVisitas } from './RepositorioVisitas';
export type { ServicioVisitasApi } from './ServicioVisitasApi';
export { repositorioVisitas };

/** API real si hay `EXPO_PUBLIC_API_URL`; si no, el servicio de prueba. */
export const servicioVisitasApi: ServicioVisitasApi = clienteApi
  ? new ServicioVisitasHttp(clienteApi)
  : new ServicioVisitasDePrueba();
