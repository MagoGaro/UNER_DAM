import { Marker } from 'react-native-maps';
import { StyleSheet, Text, View } from 'react-native';

import type { Coordenadas } from '@/src/tipos/coordenadas';

interface MarcadorUsuarioProps {
  posicion: Coordenadas;
}

/** Punto azul + burbuja "Vos estás acá" sobre la posición del usuario. */
export function MarcadorUsuario({ posicion }: MarcadorUsuarioProps) {
  return (
    <Marker
      coordinate={{ latitude: posicion.latitud, longitude: posicion.longitud }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
      zIndex={10}>
      <View style={styles.contenedor}>
        <View style={styles.burbuja}>
          <Text style={styles.texto}>Vos estás acá</Text>
        </View>
        <View style={styles.puntoExterior}>
          <View style={styles.punto} />
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
  },
  burbuja: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  texto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212529',
  },
  puntoExterior: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(51, 154, 240, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  punto: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#339AF0',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
