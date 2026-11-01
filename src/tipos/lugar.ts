import type { Categoria } from './categoria';
import type { Coordenadas } from './coordenadas';

/**
 * Campos mínimos que necesita esta parte (mapa, «Cerca tuyo», flecha y
 * avisos de proximidad). El detalle completo del lugar (horarios, precio,
 * audioguía, etc.) lo define el Integrante 1; cuando entregue el tipo
 * definitivo en src/tipos/, `Lugar` debe extenderlo sin romper este
 * contrato, ya que todo este módulo depende únicamente de estos campos.
 */
export interface Horario {
  dia: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  abre: string;
  cierra: string;
  temporada?:  'Verano' | 'Invierno' | 'todo_el_anio';
}
export interface Audioguia{
  url: string;
  duracionSegundos: number;
  idioma: 'es'| 'en' | 'pt';

}
export interface Lugar {
   id: string;
  categoriaId: string;
  descripcionCorta: string;
  descripcion: string;
  direccion: string;
  imagenes: string[];
  horarios: Horario[];
  telefono: string| null;
  sitioWeb: string| null;
  precioEntrada: number| null;
  audioguia: Audioguia| null;
  codigoQr: string | null;
  accesible: boolean;
  actualizadoEn: string;
  nombre: string;
  categoria?: Categoria;
  coordenadas: Coordenadas;
  activo: boolean;
  /**
   * Campos opcionales solo para la tarjeta de «Cerca tuyo» (foto,
   * puntaje, bajada). Provisorios: el detalle real (con audioguía,
   * horarios, etc.) lo define el Integrante 1.
   */
  imagenUrl?: string;
  calificacion?: number;
  
}
