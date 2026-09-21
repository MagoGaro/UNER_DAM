import Ionicons from '@expo/vector-icons/Ionicons';
import { Callout, Marker } from 'react-native-maps';
import { StyleSheet, Text, View } from 'react-native';

import { obtenerMetadatoCategoria } from '@/src/tipos/categoria';
import type { LugarCercano } from '@/src/hooks/useLugaresCercanos';

interface MarcadorLugarProps {
  lugar: LugarCercano;
  onVerDetalle: (lugar: LugarCercano) => void;
}

/** Un marcador del mapa: color e ícono según la categoría del lugar (tareas 1 y 2). */
export function MarcadorLugar({ lugar, onVerDetalle }: MarcadorLugarProps) {
  const metadato = obtenerMetadatoCategoria(lugar.categoria);

  return (
    <Marker
      coordinate={{ latitude: lugar.coordenadas.latitud, longitude: lugar.coordenadas.longitud }}
      title={lugar.nombre}
      tracksViewChanges={false}>
      <View style={[styles.pin, { backgroundColor: metadato.color }]}>
        <Ionicons name={metadato.icono} size={16} color="#fff" />
      </View>
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
  pin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
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
