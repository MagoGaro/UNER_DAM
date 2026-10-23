import { Callout, Marker } from 'react-native-maps';
import { StyleSheet, Text, View } from 'react-native';

import { obtenerMetadatoCategoria } from '@/src/tipos/categoria';
import type { LugarCercano } from '@/src/hooks/useLugaresCercanos';

interface MarcadorLugarProps {
  lugar: LugarCercano;
  onVerDetalle: (lugar: LugarCercano) => void;
}

/**
 * Un marcador del mapa: pin nativo con el color de la categoría del
 * lugar (tareas 1 y 2). Se usa el pin por defecto de react-native-maps
 * (en vez de un ícono custom) para que tenga la forma de lágrima
 * clásica de un mapa, más liviano y consistente entre Android/iOS.
 */
export function MarcadorLugar({ lugar, onVerDetalle }: MarcadorLugarProps) {
  // Se usa `categoriaId` (siempre presente); antes se leía `categoria`, que
  // los mocks no cargan, y todos los pines quedaban del mismo color.
  const metadato = obtenerMetadatoCategoria(lugar.categoriaId ?? lugar.categoria);

  return (
    <Marker
      coordinate={{ latitude: lugar.coordenadas.latitud, longitude: lugar.coordenadas.longitud }}
      title={lugar.nombre}
      pinColor={metadato.color}>
      <Callout onPress={() => onVerDetalle(lugar)} tooltip={false}>
        <View style={styles.callout}>
          <Text style={styles.calloutNombre} numberOfLines={2}>
            {lugar.nombre}
          </Text>
          <Text style={styles.calloutDistancia}>
            {lugar.distanciaFormateada ?? metadato.etiqueta}
          </Text>
          <Text style={styles.calloutAccion}>Ver detalle ›</Text>
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  callout: {
    minWidth: 160,
    maxWidth: 240,
    gap: 2,
    padding: 4,
  },
  calloutNombre: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212529',
  },
  calloutDistancia: {
    fontSize: 13,
    color: '#495057',
  },
  calloutAccion: {
    fontSize: 12,
    color: '#339AF0',
    fontWeight: '600',
    marginTop: 4,
  },
});
