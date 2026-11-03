import { clienteApi } from '@/src/servicios/api';
import { ServicioEventosApi } from './servicioEventosApi';
import { ServicioEventosDePrueba } from './servicioEventosDePrueba';
import type { ServicioEventos } from './ServicioEventos';

export type { FiltrosEventos, ServicioEventos } from './ServicioEventos';
export { ServicioEventosDePrueba } from './servicioEventosDePrueba';

/** API real si hay `EXPO_PUBLIC_API_URL`; si no, el servicio de prueba. */
export const servicioEventos: ServicioEventos = clienteApi ? new ServicioEventosApi(clienteApi) : new ServicioEventosDePrueba();
