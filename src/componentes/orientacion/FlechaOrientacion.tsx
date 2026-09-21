import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { useRumboDispositivo } from '@/src/hooks/useRumboDispositivo';
import type { LugarCercano } from '@/src/hooks/useLugaresCercanos';
import type { Coordenadas } from '@/src/tipos/coordenadas';
import { rumboGrados } from '@/src/utils/geo';
import { UMBRAL_LEJOS_METROS } from '@/src/configuracion/preferenciasPorDefecto';

interface FlechaOrientacionProps {
  lugar: LugarCercano | null;
  posicionUsuario: Coordenadas | null;
}

/**
 * Flecha que apunta hacia `lugar` combinando el rumbo hacia el lugar con
 * el rumbo del celular (tarea 6). Se oculta —no apunta mal— cuando falta
 * la brújula, la posición, o el lugar está lo bastante cerca como para
 * guiarse con el mapa (caso "magnetómetro no disponible" del seguimiento).
 */
export function FlechaOrientacion({ lugar, posicionUsuario }: FlechaOrientacionProps) {
  const { rumboGrados: rumboDispositivo, disponible } = useRumboDispositivo();

  if (!lugar || !posicionUsuario || !disponible || rumboDispositivo === null) return null;
  if (lugar.distanciaMetros !== null && lugar.distanciaMetros < UMBRAL_LEJOS_METROS) return null;

  const rumboHaciaLugar = rumboGrados(posicionUsuario, lugar.coordenadas);
  const angulo = (rumboHaciaLugar - rumboDispositivo + 360) % 360;

  return (
    <View style={styles.tarjeta} testID="flecha-orientacion">
      <View style={[styles.flecha, { transform: [{ rotate: `${angulo}deg` }] }]}>
        <Ionicons name="navigate" size={28} color="#339AF0" />
      </View>
      <View style={styles.info}>
        <Text style={styles.nombre} numberOfLines={1}>
          {lugar.nombre}
        </Text>
        {lugar.distanciaFormateada ? <Text style={styles.distancia}>{lugar.distanciaFormateada}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  flecha: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flexShrink: 1,
  },
  nombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  distancia: {
    fontSize: 12,
    color: '#868E96',
  },
});
