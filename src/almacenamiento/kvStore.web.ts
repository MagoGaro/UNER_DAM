/**
 * Versión web de kvStore: expo-sqlite en navegador necesita cabeceras
 * COOP/COEP del servidor, así que en `npm run web` se usa localStorage.
 * Misma interfaz que kvStore.ts; Metro elige este archivo solo en web.
 */
import type { KVStore } from './kvStore';

export type { KVStore } from './kvStore';

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

const memoria = new Map<string, string>();

export const kvStorePersistente: KVStore = {
  async obtener(clave) {
    const s = storage();
    return s ? s.getItem(clave) : (memoria.get(clave) ?? null);
  },
  async guardar(clave, valor) {
    const s = storage();
    if (s) s.setItem(clave, valor);
    else memoria.set(clave, valor);
  },
  async borrar(clave) {
    const s = storage();
    if (s) s.removeItem(clave);
    else memoria.delete(clave);
  },
};

export const kvStoreAsyncStorage = kvStorePersistente;

export function crearKVStoreEnMemoria(): KVStore {
  const datos = new Map<string, string>();
  return {
    async obtener(clave) {
      return datos.has(clave) ? datos.get(clave)! : null;
    },
    async guardar(clave, valor) {
      datos.set(clave, valor);
    },
    async borrar(clave) {
      datos.delete(clave);
    },
  };
}

export async function leerJSON<T>(store: KVStore, clave: string, porDefecto: T): Promise<T> {
  try {
    const texto = await store.obtener(clave);
    if (texto === null) return porDefecto;
    return JSON.parse(texto) as T;
  } catch {
    return porDefecto;
  }
}

export async function guardarJSON(store: KVStore, clave: string, valor: unknown): Promise<void> {
  try {
    await store.guardar(clave, JSON.stringify(valor));
  } catch {
    // best-effort
  }
}
