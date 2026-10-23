import { guardarJSON, kvStorePersistente, leerJSON } from '@/src/almacenamiento/kvStore';
import type { Visita } from '@/src/tipos/visita';
import type { RepositorioVisitas } from './RepositorioVisitas';

/**
 * Versión web (`npm run web`): expo-sqlite en navegador necesita
 * cabeceras COOP/COEP, así que en web la cola se guarda en localStorage
 * con la misma interfaz. En el celular se usa repositorioVisitas.ts.
 */
const CLAVE = 'recorrido:visitas:v1';

async function leer(): Promise<Visita[]> {
  return leerJSON<Visita[]>(kvStorePersistente, CLAVE, []);
}

export const repositorioVisitas: RepositorioVisitas = {
  async listar() {
    return (await leer()).sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
  },
  async guardar(v) {
    const todas = (await leer()).filter((x) => x.id !== v.id);
    await guardarJSON(kvStorePersistente, CLAVE, [...todas, v]);
  },
  async actualizar(id, cambios) {
    const todas = await leer();
    await guardarJSON(kvStorePersistente, CLAVE, todas.map((v) => (v.id === id ? { ...v, ...cambios } : v)));
  },
  async eliminar(id) {
    await guardarJSON(kvStorePersistente, CLAVE, (await leer()).filter((v) => v.id !== id));
  },
  async pendientes() {
    return (await leer()).filter((v) => !v.sincronizada);
  },
};
