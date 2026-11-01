/**
 * Colores y medidas compartidos por Agenda y Mi recorrido. Se usa al sol
 * y con una mano: contraste fuerte (texto oscuro sobre claro, AA o más)
 * y botones de al menos 48 px de alto.
 */
export const COLORES = {
  primario: '#C2410C', // naranja oscurecido de #E8590C para pasar contraste AA con texto blanco
  primarioClaro: '#FFF0E6',
  texto: '#14212B',
  textoSecundario: '#3F4B57',
  textoTenue: '#5C6B7A',
  fondo: '#F4F6F8',
  superficie: '#FFFFFF',
  borde: '#D5DBE1',
  exito: '#1B5E20',
  exitoClaro: '#E6F4EA',
  peligro: '#B3261E',
  peligroClaro: '#FFE3E3',
  aviso: '#7A4100',
  avisoClaro: '#FFF3BF',
  enlace: '#0B5394',
} as const;

export const ALTO_BOTON = 52;
export const RADIO = 14;
