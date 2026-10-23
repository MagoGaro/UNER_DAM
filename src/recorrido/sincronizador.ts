import type { RepositorioVisitas } from '@/src/servicios/visitas/RepositorioVisitas';
import type { ServicioVisitasApi } from '@/src/servicios/visitas/ServicioVisitasApi';
import { esError } from '@/src/tipos/api';

export interface ResultadoSincronizacion {
  subidas: number;
  fallidas: number;
  /** true si no se intentó porque no había conexión. */
  sinConexion: boolean;
}

/**
 * Sube la cola de visitas pendientes, de a una y en orden. Si una falla
 * (se cayó la señal a mitad de camino) se corta y se reintenta después:
 * ninguna visita se pierde ni se marca como subida sin estarlo.
 */
export async function sincronizarPendientes(
  repo: RepositorioVisitas,
  api: ServicioVisitasApi,
  hayConexion: boolean
): Promise<ResultadoSincronizacion> {
  if (!hayConexion) return { subidas: 0, fallidas: 0, sinConexion: true };

  const pendientes = await repo.pendientes();
  let subidas = 0;
  let fallidas = 0;

  for (const visita of pendientes) {
    try {
      const respuesta = await api.subirVisita(visita);
      if (esError(respuesta)) {
        fallidas += 1;
        continue; // error de datos: se sigue con las demás y queda pendiente
      }
      await repo.actualizar(visita.id, { sincronizada: true });
      subidas += 1;
    } catch {
      fallidas += 1;
      break; // error de red: cortar y reintentar más tarde
    }
  }
  return { subidas, fallidas, sinConexion: false };
}
