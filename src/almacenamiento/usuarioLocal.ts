import { kvStorePersistente, type KVStore } from './kvStore';

const CLAVE = 'usuario:idLocal';

/**
 * Hasta que exista la cuenta (Integrante 3), las visitas se guardan a
 * nombre de un id local del teléfono ("usr-local-…"). Cuando el turista
 * inicie sesión, el servidor puede reasignar esas visitas a su cuenta.
 */
export async function obtenerUsuarioId(store: KVStore = kvStorePersistente): Promise<string> {
  try {
    const existente = await store.obtener(CLAVE);
    if (existente) return existente;
    const nuevo = `usr-local-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    await store.guardar(CLAVE, nuevo);
    return nuevo;
  } catch {
    return 'usr-local-sin-almacenamiento';
  }
}
