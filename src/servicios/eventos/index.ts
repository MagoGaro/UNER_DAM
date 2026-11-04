import { clienteApi } from '@/src/servicios/api';
import { ServicioEventosApi } from './servicioEventosApi';
import type { ServicioEventos } from './ServicioEventos';

export type { FiltrosEventos, ServicioEventos } from './ServicioEventos';

export const servicioEventos: ServicioEventos = new ServicioEventosApi(clienteApi);
