import { clienteApi } from '@/src/servicios/api';
import { ServicioAuthApi } from './servicioAuthApi';
import type { ServicioAuth } from './ServicioAuth';
import { ServicioAuthDePrueba } from './servicioAuthDePrueba';

export type { DatosIngreso, DatosRegistro, ServicioAuth, SesionApi } from './ServicioAuth';

/** API real si hay `EXPO_PUBLIC_API_URL`; si no, el servicio de prueba. */
export const servicioAuth: ServicioAuth = clienteApi ? new ServicioAuthApi(clienteApi) : new ServicioAuthDePrueba();
