import { clienteApi } from '@/src/servicios/api';
import type { ServicioEventosGuardados } from './ServicioEventosGuardados';
import { ServicioEventosGuardadosApi } from './servicioEventosGuardadosApi';

export type { ServicioEventosGuardados } from './ServicioEventosGuardados';

export const servicioEventosGuardados: ServicioEventosGuardados = new ServicioEventosGuardadosApi(clienteApi);
