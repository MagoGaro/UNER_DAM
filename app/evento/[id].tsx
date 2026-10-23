import { useLocalSearchParams } from 'expo-router';

import { DetalleEventoPantalla } from '@/src/pantallas/DetalleEventoPantalla';

export default function DetalleEventoRuta() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DetalleEventoPantalla id={id} />;
}
