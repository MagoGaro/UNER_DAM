import { ServicioEventosDePrueba } from './servicioEventosDePrueba';
import type { ServicioEventos } from './ServicioEventos';

export type { FiltrosEventos, ServicioEventos } from './ServicioEventos';
export { ServicioEventosDePrueba } from './servicioEventosDePrueba';

/** Única línea a cambiar cuando llegue la API de la cátedra. */
export const servicioEventos: ServicioEventos = new ServicioEventosDePrueba();
