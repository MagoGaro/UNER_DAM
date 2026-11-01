import type { ServicioFavoritos } from './ServicioFavoritos';
import { ServicioFavoritosDePrueba } from './servicioFavoritosDePrueba';

export type { ServicioFavoritos } from './ServicioFavoritos';

/** Única línea a cambiar cuando llegue la API real. */
export const servicioFavoritos: ServicioFavoritos = new ServicioFavoritosDePrueba();
