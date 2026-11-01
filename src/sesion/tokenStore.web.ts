/**
 * expo-secure-store no existe en el navegador: en `npm run web` el token
 * vive solo en memoria (se pierde al recargar). Es solo para desarrollo.
 */
import { crearTokenStoreEnMemoria, type TokenStore } from './tokenStore';

export type { TokenStore } from './tokenStore';
export { crearTokenStoreEnMemoria };

export const tokenStoreSeguro: TokenStore = crearTokenStoreEnMemoria();
