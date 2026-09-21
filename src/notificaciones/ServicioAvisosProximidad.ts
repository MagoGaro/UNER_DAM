import type { Lugar } from '@/src/tipos/lugar';

/**
 * Puerto para avisar al turista que entró en el radio de un lugar. Los
 * hooks dependen de esta interfaz, no de expo-notifications directamente,
 * para poder testear la lógica de "cuándo avisar" con una implementación
 * falsa que solo registra llamadas.
 */
export interface ServicioAvisosProximidad {
  pedirPermiso(): Promise<boolean>;
  avisarLlegada(lugar: Lugar): Promise<void>;
}
