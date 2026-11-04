import { tokenStoreSeguro } from '@/src/sesion/tokenStore';
import { clienteSinServidor, crearCliente, type ClienteApi } from './cliente';
import { URL_API, usaApiReal } from './config';

export { URL_API, usaApiReal } from './config';
export type { ClienteApi } from './cliente';

/** Cliente de la API real. Sin `EXPO_PUBLIC_API_URL` responde error y no inventa datos. */
export const clienteApi: ClienteApi =
  usaApiReal && URL_API
    ? crearCliente({ urlBase: URL_API, leerToken: () => tokenStoreSeguro.leer() })
    : clienteSinServidor();
