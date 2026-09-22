import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

/**
 * Categorías de lugar provisorias, a confirmar con el equipo (acuerdo
 * "Tipos cerrados en src/tipos/" pendiente con Integrante 1). Se listan
 * acá en un único lugar: agregar una categoría nueva implica sumar una
 * entrada a `CATEGORIAS` y no tocar ningún componente. Ajustadas para
 * calzar con el mockup de diseño (playas y termas primero, son las
 * categorías fuertes de Colón).
 */
export type Categoria =
  | 'playa'
  | 'termas'
  | 'museo'
  | 'monumento'
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
  playa: { categoria: 'playa', etiqueta: 'Playas', color: '#2E9E4C', icono: 'water' },
  termas: { categoria: 'termas', etiqueta: 'Termas', color: '#E8590C', icono: 'flame' },
  museo: { categoria: 'museo', etiqueta: 'Museos', color: '#6A4C93', icono: 'business' },
  monumento: { categoria: 'monumento', etiqueta: 'Monumentos', color: '#8E5A2D', icono: 'flag' },
  mirador: { categoria: 'mirador', etiqueta: 'Miradores', color: '#1C7ED6', icono: 'eye' },
  restaurante: { categoria: 'restaurante', etiqueta: 'Restaurantes', color: '#E03131', icono: 'restaurant' },
  alojamiento: { categoria: 'alojamiento', etiqueta: 'Alojamiento', color: '#D6336C', icono: 'bed' },
  otro: { categoria: 'otro', etiqueta: 'Otro', color: '#6C757D', icono: 'location' },
};

export const CATEGORIAS: readonly Categoria[] = Object.keys(METADATOS) as Categoria[];

export function obtenerMetadatoCategoria(categoria: Categoria): MetadatoCategoria {
  return METADATOS[categoria];
}
