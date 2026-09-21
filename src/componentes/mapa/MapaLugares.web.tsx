import { StyleSheet, Text, View } from 'react-native';

import type { LugarCercano } from '@/src/hooks/useLugaresCercanos';
import type { Coordenadas } from '@/src/tipos/coordenadas';

interface MapaLugaresProps {
  lugares: LugarCercano[];
  posicionUsuario: Coordenadas | null;
  onVerDetalle: (lugar: LugarCercano) => void;
}

/**
 * react-native-maps no soporta web (ver docs.expo.dev/versions/v54.0.0/sdk/map-view/
 * y sdk/maps/). Metro resuelve este archivo en vez de MapaLugares.tsx al
 * compilar para web, así que la app sigue funcionando en Android/iOS y
 * solo se degrada acá, en vez de romper el bundle de web entero. Usá la
 * vista «Cerca tuyo» en web mientras tanto.
 */
export function MapaLugares(_props: MapaLugaresProps) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.texto}>El mapa solo está disponible en la app Android/iOS.</Text>
      <Text style={styles.subtexto}>Usá la vista «Cerca tuyo» para ver los lugares en la web.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  texto: {
    fontSize: 15,
    fontWeight: '600',
    color: '#343A40',
    textAlign: 'center',
  },
  subtexto: {
    fontSize: 13,
    color: '#868E96',
    textAlign: 'center',
  },
});
