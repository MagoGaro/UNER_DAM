import { Linking, Platform } from 'react-native';

import type { Coordenadas } from '@/src/tipos/coordenadas';

export type ModoViaje = 'caminando' | 'auto';

function urlAppleMaps(destino: Coordenadas, modo: ModoViaje): string {
  const dirflg = modo === 'caminando' ? 'w' : 'd';
  return `https://maps.apple.com/?daddr=${destino.latitud},${destino.longitud}&dirflg=${dirflg}`;
}

function urlGoogleMaps(destino: Coordenadas, modo: ModoViaje): string {
  const travelmode = modo === 'caminando' ? 'walking' : 'driving';
  return `https://www.google.com/maps/dir/?api=1&destination=${destino.latitud},${destino.longitud}&travelmode=${travelmode}`;
}

/**
 * Abre la app de mapas nativa (Apple Maps en iOS, Google Maps en Android)
 * con la ruta a pie o en auto hacia `destino`. En caso de no poder abrir
 * la app (por ejemplo, ningún cliente de mapas instalado), devuelve
 * `false` en vez de lanzar una excepción, para que quien llame pueda
 * mostrar un aviso al usuario.
 */
export async function abrirComoLlegar(destino: Coordenadas, modo: ModoViaje): Promise<boolean> {
  const url = Platform.OS === 'ios' ? urlAppleMaps(destino, modo) : urlGoogleMaps(destino, modo);

  const puedeAbrir = await Linking.canOpenURL(url);
  if (!puedeAbrir) return false;

  await Linking.openURL(url);
  return true;
}
