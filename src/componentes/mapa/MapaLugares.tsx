import { StyleSheet } from 'react-native';
import MapView, { type Region } from 'react-native-maps';

import type { LugarCercano } from '@/src/hooks/useLugaresCercanos';
import type { Coordenadas } from '@/src/tipos/coordenadas';
import { MarcadorLugar } from './MarcadorLugar';
import { MarcadorUsuario } from './MarcadorUsuario';

const REGION_COLON: Region = {
  latitude: -32.2241,
  longitude: -58.1419,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

interface MapaLugaresProps {
  lugares: LugarCercano[];
  posicionUsuario: Coordenadas | null;
  onVerDetalle: (lugar: LugarCercano) => void;
}

/** Mapa con los lugares activos y el punto del usuario (tarea 1). */
export function MapaLugares({ lugares, posicionUsuario, onVerDetalle }: MapaLugaresProps) {
  const regionInicial: Region = posicionUsuario
    ? {
        latitude: posicionUsuario.latitud,
        longitude: posicionUsuario.longitud,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }
    : REGION_COLON;

  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={regionInicial}
      testID="mapa-lugares">
      {posicionUsuario ? <MarcadorUsuario posicion={posicionUsuario} /> : null}
      {lugares.map((lugar) => (
        <MarcadorLugar key={lugar.id} lugar={lugar} onVerDetalle={onVerDetalle} />
      ))}
    </MapView>
  );
}
