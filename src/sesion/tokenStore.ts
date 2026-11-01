import * as SecureStore from 'expo-secure-store';

/**
 * Dónde vive el token de sesión. Va en expo-secure-store (Keychain en
 * iPhone, Keystore en Android) y NUNCA en kv-store, como pide el pedido.
 */
export interface TokenStore {
  leer(): Promise<string | null>;
  guardar(token: string): Promise<void>;
  borrar(): Promise<void>;
}

const CLAVE = 'sesion.token';

export const tokenStoreSeguro: TokenStore = {
  async leer() {
    try {
      return await SecureStore.getItemAsync(CLAVE);
    } catch {
      return null;
    }
  },
  async guardar(token) {
    await SecureStore.setItemAsync(CLAVE, token);
  },
  async borrar() {
    try {
      await SecureStore.deleteItemAsync(CLAVE);
    } catch {
      // Si no se puede borrar, la sesión igual se da por cerrada en memoria.
    }
  },
};

/** Implementación en memoria (tests y web, donde no hay almacén seguro). */
export function crearTokenStoreEnMemoria(inicial: string | null = null): TokenStore {
  let token = inicial;
  return {
    async leer() {
      return token;
    },
    async guardar(t) {
      token = t;
    },
    async borrar() {
      token = null;
    },
  };
}
