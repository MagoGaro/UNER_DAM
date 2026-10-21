import type { Lugar } from '@/src/tipos/lugar';
import type { ServicioAvisosProximidad } from './ServicioAvisosProximidad';

/**
 * Implementación compatible con Expo Go para desarrollo local.
 * Evita la importación de expo-notifications en SDK 53+.
 */
export class ServicioAvisosProximidadExpo implements ServicioAvisosProximidad {
  async pedirPermiso(): Promise<boolean> {
    console.log('[AvisosProximidad] Permiso concedido (simulado en Expo Go)');
    return true;
  }

  async avisarLlegada(lugar: Lugar): Promise<void> {
    console.log(`[AvisosProximidad] ¡Llegaste a: ${lugar.nombre}!`);
  }
}
