import { kvStoreAsyncStorage, type KVStore } from './kvStore';

/** Fecha local en formato YYYY-MM-DD (no UTC, para no cruzar el día antes de tiempo). */
function fechaDeHoy(): string {
  const ahora = new Date();
  const año = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

function claveAviso(lugarId: string, fecha: string): string {
  return `avisoProximidad:${fecha}:${lugarId}`;
}

/**
 * Registro de qué lugares ya avisaron proximidad hoy (tarea 8: máximo un
 * aviso por lugar y por día). Se arma con `crearRegistroAvisosDiarios` en
 * vez de exportar funciones sueltas para poder inyectar un KVStore de
 * prueba en los tests, sin depender de AsyncStorage real.
 */
export function crearRegistroAvisosDiarios(store: KVStore) {
  return {
    async yaAviseHoy(lugarId: string): Promise<boolean> {
      const valor = await store.obtener(claveAviso(lugarId, fechaDeHoy()));
      return valor !== null;
    },
    async marcarAviso(lugarId: string): Promise<void> {
      await store.guardar(claveAviso(lugarId, fechaDeHoy()), '1');
    },
  };
}

const registroPorDefecto = crearRegistroAvisosDiarios(kvStoreAsyncStorage);

export const yaAviseHoy = registroPorDefecto.yaAviseHoy;
export const marcarAviso = registroPorDefecto.marcarAviso;
