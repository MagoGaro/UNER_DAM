import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

/**
 * Categorías de lugar provisorias, a confirmar con el equipo (acuerdo
 * "Tipos cerrados en src/tipos/" pendiente con Integrante 1). Se listan
 * acá en un único lugar: agregar una categoría nueva implica sumar una
 * entrada a `CATEGORIAS` y no tocar ningún componente.
 */
export type Categoria =
  | 'monumento'
  | 'museo'
  | 'plaza'
  | 'iglesia'
  | 'mirador'
  | 'restaurante'
  | 'alojamiento'
  | 'otro';

export interface MetadatoCategoria {
  categoria: Categoria;
  etiqueta: string;
  color: string;
  icono: ComponentProps<typeof Ionicons>['name'];
}

const METADATOS: Record<Categoria, MetadatoCategoria> = {
  monumento: { categoria: 'monumento', etiqueta: 'Monumento', color: '#8E5A2D', icono: 'business' },
  museo: { categoria: 'museo', etiqueta: 'Museo', color: '#6A4C93', icono: 'library' },
  plaza: { categoria: 'plaza', etiqueta: 'Plaza', color: '#2E9E4C', icono: 'leaf' },
  iglesia: { categoria: 'iglesia', etiqueta: 'Iglesia', color: '#3D5AFE', icono: 'business-outline' },
  mirador: { categoria: 'mirador', etiqueta: 'Mirador', color: '#00897B', icono: 'eye' },
  restaurante: { categoria: 'restaurante', etiqueta: 'Restaurante', color: '#E85D3D', icono: 'restaurant' },
  alojamiento: { categoria: 'alojamiento', etiqueta: 'Alojamiento', color: '#D6336C', icono: 'bed' },
  otro: { categoria: 'otro', etiqueta: 'Otro', color: '#6C757D', icono: 'location' },
};

export const CATEGORIAS: readonly Categoria[] = Object.keys(METADATOS) as Categoria[];

export function obtenerMetadatoCategoria(categoria: Categoria): MetadatoCategoria {
  return METADATOS[categoria];
}
