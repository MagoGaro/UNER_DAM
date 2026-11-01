import { useLocalSearchParams } from 'expo-router';

import { ConfirmarVisitaPantalla } from '@/src/pantallas/registrar/ConfirmarVisitaPantalla';

export default function ConfirmarVisitaRuta() {
  const { lugarId, origen } = useLocalSearchParams<{ lugarId?: string; origen?: string }>();
  return <ConfirmarVisitaPantalla lugarId={lugarId} origen={origen} />;
}
