import type { ServicioAuth } from './ServicioAuth';
import { ServicioAuthDePrueba } from './servicioAuthDePrueba';

export type { DatosIngreso, DatosRegistro, ServicioAuth, SesionApi } from './ServicioAuth';

/** Única línea a cambiar cuando llegue la API real. */
export const servicioAuth: ServicioAuth = new ServicioAuthDePrueba();
