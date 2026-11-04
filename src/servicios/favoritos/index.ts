import { clienteApi } from '@/src/servicios/api';
import type { ServicioFavoritos } from './ServicioFavoritos';
import { ServicioFavoritosApi } from './servicioFavoritosApi';

export type { ServicioFavoritos } from './ServicioFavoritos';

export const servicioFavoritos: ServicioFavoritos = new ServicioFavoritosApi(clienteApi);
