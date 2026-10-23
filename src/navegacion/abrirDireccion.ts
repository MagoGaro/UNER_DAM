import { Linking, Platform } from 'react-native';

/**
 * Para eventos con dirección suelta y sin coordenadas ("Playa Norte,
 * frente al parador..."): abre la app de mapas buscando ese texto en
 * Colón. Devuelve false si no se pudo abrir, nunca tira.
 */
export async function abrirDireccionEnMapa(direccion: string): Promise<boolean> {
  const consulta = encodeURIComponent(`${direccion}, Colón, Entre Ríos`);
  const url =
    Platform.OS === 'ios'
      ? `https://maps.apple.com/?q=${consulta}`
      : `https://www.google.com/maps/search/?api=1&query=${consulta}`;
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
