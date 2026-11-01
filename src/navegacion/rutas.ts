import type { Href } from 'expo-router';

import type { OrigenVisita } from '@/src/tipos/visita';

/**
 * Único lugar que conoce la forma de las rutas. Si el Integrante 1
 * define otra ruta para el detalle del lugar, este es el único archivo
 * que hay que tocar (acuerdo pendiente "Ruta de navegación al detalle
 * del lugar").
 */
export function rutaDetalleLugar(id: string): Href {
  return { pathname: '/lugar/[id]', params: { id } };
}

export function rutaDetalleEvento(id: string): Href {
  return { pathname: '/evento/[id]', params: { id } };
}

export function rutaDetalleVisita(id: string): Href {
  return { pathname: '/visita/[id]', params: { id } };
}

export function rutaEscanearQr(): Href {
  return '/registrar/qr';
}

/** Elegir lugar a mano (`modo: manual`) o el más cercano por GPS (`modo: gps`). */
export function rutaElegirLugar(modo: 'manual' | 'gps'): Href {
  return { pathname: '/registrar/elegir', params: { modo } };
}

export function rutaConfirmarVisita(lugarId: string, origen: OrigenVisita): Href {
  return { pathname: '/registrar/confirmar', params: { lugarId, origen } };
}

export function rutaCamara(): Href {
  return '/registrar/camara';
}
