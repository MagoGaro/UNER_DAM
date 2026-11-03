import { tokenStoreSeguro } from '@/src/sesion/tokenStore';
import { crearCliente, type ClienteApi } from './cliente';
import { URL_API, usaApiReal } from './config';

export { URL_API, usaApiReal } from './config';
export type { ClienteApi } from './cliente';

/** Cliente de la API real, o null si no se configuró `EXPO_PUBLIC_API_URL`. */
export const clienteApi: ClienteApi | null =
  usaApiReal && URL_API ? crearCliente({ urlBase: URL_API, leerToken: () => tokenStoreSeguro.leer() }) : null;
