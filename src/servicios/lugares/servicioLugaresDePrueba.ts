import type { FiltrosLugares, ServicioLugares } from './ServicioLugares';
import { LUGARES_DE_PRUEBA } from './lugaresDePrueba';
import type {Lugar} from '@/src/tipos/lugar';

/**
 * Implementación de ServicioLugares sobre los datos de prueba locales.
 * Es el único lugar que el Integrante 1 necesita reemplazar (por un
 * servicio que llame a la API real) para que el resto de esta parte
 * siga funcionando sin cambios: todo lo demás depende de la interfaz
 * ServicioLugares, no de esta clase.
 */
export class ServicioLugaresDePrueba implements ServicioLugares {
  async listarLugares(filtros?: FiltrosLugares): Promise<readonly Lugar[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let resultado = LUGARES_DE_PRUEBA.filter((lugar) => lugar.activo);

        if (filtros?.categoriaId) {
          resultado = resultado.filter(
            (lugar) => lugar.categoriaId === filtros.categoriaId
         );
        }

    //Incorporo la busqueda por texto solicitada en los requisitos[425]

        if(filtros?.busqueda) {
          const termino = filtros.busqueda.toLowerCase();
          resultado = resultado.filter((lugar) => 
            lugar.nombre.toLowerCase().includes(termino) ||
            lugar.descripcionCorta.toLocaleLowerCase().includes(termino)
    
          );
        }
  
        resolve(resultado);
      }, 600);
    });
  }
  async obtenerPorId(id: string): Promise<Lugar | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lugar = LUGARES_DE_PRUEBA.find((l) => l.id === id && l.activo) || null;
        resolve(lugar);
      }, 400);
    });
  } 
}   


