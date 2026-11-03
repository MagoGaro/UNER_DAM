import { clienteApi } from '@/src/servicios/api';
import type { ServicioFavoritos } from './ServicioFavoritos';
import { ServicioFavoritosApi } from './servicioFavoritosApi';
import { ServicioFavoritosDePrueba } from './servicioFavoritosDePrueba';

export type { ServicioFavoritos } from './ServicioFavoritos';

/** API real si hay `EXPO_PUBLIC_API_URL`; si no, el servicio de prueba. */
export const servicioFavoritos: ServicioFavoritos = clienteApi
  ? new ServicioFavoritosApi(clienteApi)
  : new ServicioFavoritosDePrueba();
