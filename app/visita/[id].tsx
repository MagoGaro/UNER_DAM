import { useLocalSearchParams } from 'expo-router';

import { DetalleVisitaPantalla } from '@/src/pantallas/DetalleVisitaPantalla';

export default function DetalleVisitaRuta() {
  const { id, nueva } = useLocalSearchParams<{ id: string; nueva?: string }>();
  return <DetalleVisitaPantalla id={id} nueva={nueva === '1'} />;
}
