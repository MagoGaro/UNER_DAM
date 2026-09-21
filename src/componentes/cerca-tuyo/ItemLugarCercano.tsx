import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { LugarCercano } from '@/src/hooks/useLugaresCercanos';
import { abrirComoLlegar, type ModoViaje } from '@/src/navegacion/abrirComoLlegar';
import { obtenerMetadatoCategoria } from '@/src/tipos/categoria';

interface ItemLugarCercanoProps {
  lugar: LugarCercano;
  onVerDetalle: (lugar: LugarCercano) => void;
}

/** Fila de la lista «Cerca tuyo»: nombre + distancia + botón «Cómo llegar» (tareas 4 y 5). */
export function ItemLugarCercano({ lugar, onVerDetalle }: ItemLugarCercanoProps) {
  const metadato = obtenerMetadatoCategoria(lugar.categoria);

  async function comoLlegar(modo: ModoViaje) {
    const abierto = await abrirComoLlegar(lugar.coordenadas, modo);
    if (!abierto) {
      Alert.alert('No se pudo abrir el mapa', 'Instalá Google Maps o Apple Maps para trazar la ruta.');
    }
  }

  return (
    <TouchableOpacity
      onPress={() => onVerDetalle(lugar)}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${lugar.nombre}`}
      style={styles.fila}>
      <View style={[styles.icono, { backgroundColor: metadato.color }]}>
        <Ionicons name={metadato.icono} size={18} color="#fff" />
      </View>

      <View style={styles.info}>
        <Text style={styles.nombre} numberOfLines={2}>
          {lugar.nombre}
        </Text>
        <Text style={styles.distancia}>{lugar.distanciaFormateada ?? metadato.etiqueta}</Text>
      </View>

      <View style={styles.acciones}>
        <TouchableOpacity
          onPress={() => comoLlegar('caminando')}
          accessibilityRole="button"
          accessibilityLabel={`Cómo llegar a pie a ${lugar.nombre}`}
          style={styles.botonAccion}>
          <Ionicons name="walk" size={20} color="#339AF0" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => comoLlegar('auto')}
          accessibilityRole="button"
          accessibilityLabel={`Cómo llegar en auto a ${lugar.nombre}`}
          style={styles.botonAccion}>
          <Ionicons name="car" size={20} color="#339AF0" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  icono: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
  },
  distancia: {
    fontSize: 13,
    color: '#868E96',
  },
  acciones: {
    flexDirection: 'row',
    gap: 4,
  },
  botonAccion: {
    padding: 8,
  },
});
