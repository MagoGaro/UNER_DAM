import * as Network from 'expo-network';
import { useEffect, useState } from 'react';

/**
 * true / false según haya internet, o null mientras no se sabe. Se
 * apoya en expo-network. Ante la duda (null) las pantallas asumen que sí
 * hay, para no mostrar avisos de "sin señal" de más.
 */
export function useConexion(): boolean | null {
  const [conectado, setConectado] = useState<boolean | null>(null);
  useEffect(() => {
    let vivo = true;
    Network.getNetworkStateAsync()
      .then((s) => vivo && setConectado(estaConectado(s)))
      .catch(() => {});
    const sub = Network.addNetworkStateListener((s) => setConectado(estaConectado(s)));
    return () => {
      vivo = false;
      sub.remove();
    };
  }, []);
  return conectado;
}

export function estaConectado(s: Network.NetworkState): boolean {
  return Boolean(s.isConnected) && s.isInternetReachable !== false;
}

export async function hayConexionAhora(): Promise<boolean> {
  try {
    return estaConectado(await Network.getNetworkStateAsync());
  } catch {
    return true; // si no se puede saber, se intenta igual
  }
}
