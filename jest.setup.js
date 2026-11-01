/* global jest */

// expo-sqlite/kv-store necesita el módulo nativo: en tests se reemplaza
// por un mapa en memoria con la misma API.
jest.mock('expo-sqlite/kv-store', () => {
  const datos = new Map();
  const Storage = {
    getItemAsync: async (k) => (datos.has(k) ? datos.get(k) : null),
    setItemAsync: async (k, v) => {
      datos.set(k, v);
    },
    removeItemAsync: async (k) => datos.delete(k),
  };
  return { __esModule: true, default: Storage };
});
