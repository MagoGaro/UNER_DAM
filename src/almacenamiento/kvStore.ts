import Storage from 'expo-sqlite/kv-store';

/**
 * Contrato mínimo de almacenamiento clave-valor persistente. Cualquier
 * módulo que necesite guardar datos simples (como el registro diario de
 * avisos) depende de esta interfaz, no de la librería directamente, para
 * poder testear con una implementación en memoria y para poder cambiar de
 * backend de almacenamiento sin tocar la lógica que lo usa.
 */
export interface KVStore {
  obtener(clave: string): Promise<string | null>;
  guardar(clave: string, valor: string): Promise<void>;
  borrar?(clave: string): Promise<void>;
}

/**
 * Implementación real, respaldada por `expo-sqlite/kv-store`, que es la
 * que pide el documento técnico (antes usaba AsyncStorage). En web se usa
 * `kvStore.web.ts` (localStorage), porque expo-sqlite en web necesita
 * cabeceras especiales del servidor.
 */
export const kvStorePersistente: KVStore = {
  obtener: (clave) => Storage.getItemAsync(clave),
  guardar: (clave, valor) => Storage.setItemAsync(clave, valor),
  borrar: async (clave) => {
    await Storage.removeItemAsync(clave);
  },
};

/** @deprecated Nombre viejo, se mantiene para no romper imports del equipo. */
export const kvStoreAsyncStorage = kvStorePersistente;

/** Implementación en memoria, para tests o para cuando el almacenamiento falla. */
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

/** Lee y parsea JSON sin romper nunca: si el dato está corrupto devuelve `porDefecto`. */
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
    // El almacenamiento local es best-effort: un fallo no debe romper la pantalla.
  }
}
