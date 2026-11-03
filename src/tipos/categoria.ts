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
  | 'gastronomia'
  | 'artesanias'
  | 'monumento'
  | 'mirador'
  | 'restaurante'
  | 'alojamiento'
  | 'bodegas'
  | 'naturaleza'
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
  gastronomia:{categoria:'gastronomia',etiqueta:'Gastronomia',color:'#E03131', icono: 'restaurant'},
  artesanias:{categoria: 'artesanias', etiqueta: 'Artesanias',color: '#F59F00', icono: 'color-palette'},
  naturaleza: { categoria: 'naturaleza', etiqueta: 'Naturaleza', color: '#6C757D', icono: 'leaf' },
  alojamiento: { categoria: 'alojamiento', etiqueta: 'Alojamiento', color: '#D6336C', icono: 'bed' },
  bodegas: { categoria: 'bodegas', etiqueta: 'Bodegas', color: '#862E9C', icono: 'wine' },
  monumento: { categoria: 'monumento', etiqueta: 'Monumentos', color: '#8E5A2D', icono: 'flag' },
  mirador: { categoria: 'mirador', etiqueta: 'Miradores', color: '#1C7ED6', icono: 'eye' },
  restaurante: {categoria : 'restaurante', etiqueta: 'Restaurante', color: '#D9480F', icono: 'restaurant' },
  otro: {categoria: 'otro', etiqueta: 'Otro', color: '#6C757D', icono: 'location' },
};

export const CATEGORIAS: readonly Categoria[] = Object.keys(METADATOS) as Categoria[];

/**
 * Acepta tanto la clave corta ('museo') como el id del catálogo
 * ('cat-museos'). Antes solo se quitaba 'cat-' y 'museos' / 'playas' no
 * coincidían con las claves en singular: el Molino figuraba como "Otro".
 */
export function obtenerMetadatoCategoria(categoria: string | undefined| null): MetadatoCategoria {
  if (!categoria) return METADATOS.otro;
  const claveLimpia = categoria.trim().toLowerCase().replace(/^cat-/,'');
  const exacta = METADATOS[claveLimpia as Categoria];
  if (exacta) return exacta;
  const singular = METADATOS[claveLimpia.replace(/s$/, '') as Categoria];
  return singular ?? METADATOS.otro;
}
