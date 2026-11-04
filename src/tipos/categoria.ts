import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

/** Categoría tal como la devuelve `GET /categorias`. */
export interface CategoriaApi {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  orden: number;
}

type NombreIcono = ComponentProps<typeof Ionicons>['name'];

export function iconoCategoria(icono: string | undefined): NombreIcono {
  return (icono as NombreIcono) || 'location-outline';
}
