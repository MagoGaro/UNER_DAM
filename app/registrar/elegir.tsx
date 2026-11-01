import { useLocalSearchParams } from 'expo-router';

import { ElegirLugarPantalla } from '@/src/pantallas/registrar/ElegirLugarPantalla';

export default function ElegirLugarRuta() {
  const { modo } = useLocalSearchParams<{ modo?: string }>();
  return <ElegirLugarPantalla modo={modo === 'gps' ? 'gps' : 'manual'} />;
}
