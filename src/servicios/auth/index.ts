import { clienteApi } from '@/src/servicios/api';
import { ServicioAuthApi } from './servicioAuthApi';
import type { ServicioAuth } from './ServicioAuth';

export type { DatosIngreso, DatosRegistro, ServicioAuth, SesionApi } from './ServicioAuth';

export const servicioAuth: ServicioAuth = new ServicioAuthApi(clienteApi);
