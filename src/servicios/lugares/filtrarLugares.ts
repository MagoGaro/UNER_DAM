import type { Lugar } from '@/src/tipos/lugar';
import type { FiltrosLugares } from './ServicioLugares';

/** Filtro por categoría y texto, igual que el del servicio de prueba. Sirve para filtrar lo guardado sin señal. */
export function filtrarLugares(lugares: readonly Lugar[], filtros?: FiltrosLugares): Lugar[] {
  let resultado = lugares.filter((l) => l.activo);
  if (filtros?.categoriaId) {
    resultado = resultado.filter((l) => l.categoriaId === filtros.categoriaId);
  }
  if (filtros?.busqueda) {
    const termino = filtros.busqueda.toLowerCase();
    resultado = resultado.filter(
      (l) => l.nombre.toLowerCase().includes(termino) || l.descripcionCorta.toLowerCase().includes(termino)
    );
  }
  return resultado;
}
