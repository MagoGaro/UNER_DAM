import type { Href } from 'expo-router';

/**
 * Único lugar que conoce la forma de la ruta de detalle. Si el
 * Integrante 1 define otra ruta para el detalle del lugar, este es el
 * único archivo que hay que tocar (acuerdo pendiente "Ruta de navegación
 * al detalle del lugar").
 */
export function rutaDetalleLugar(id: string): Href {
  return { pathname: '/lugar/[id]', params: { id } };
}
