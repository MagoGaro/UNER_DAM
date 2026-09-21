import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Contrato mínimo de almacenamiento clave-valor persistente. Cualquier
 * módulo que necesite guardar datos simples (como el registro diario de
 * avisos) depende de esta interfaz, no de AsyncStorage directamente, para
 * poder testear con una implementación en memoria y para poder cambiar de
 * backend de almacenamiento sin tocar la lógica que lo usa.
 */
export interface KVStore {
  obtener(clave: string): Promise<string | null>;
  guardar(clave: string, valor: string): Promise<void>;
}

/** Implementación real, respaldada por @react-native-async-storage/async-storage. */
export const kvStoreAsyncStorage: KVStore = {
  obtener: (clave) => AsyncStorage.getItem(clave),
  guardar: (clave, valor) => AsyncStorage.setItem(clave, valor),
};

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
  };
}
