import type { ServicioLugares } from './ServicioLugares';
import { LUGARES_DE_PRUEBA } from './lugaresDePrueba';

/**
 * Implementación de ServicioLugares sobre los datos de prueba locales.
 * Es el único lugar que el Integrante 1 necesita reemplazar (por un
 * servicio que llame a la API real) para que el resto de esta parte
 * siga funcionando sin cambios: todo lo demás depende de la interfaz
 * ServicioLugares, no de esta clase.
 */
export class ServicioLugaresDePrueba implements ServicioLugares {
  async listarLugares() {
    return LUGARES_DE_PRUEBA;
  }
}
