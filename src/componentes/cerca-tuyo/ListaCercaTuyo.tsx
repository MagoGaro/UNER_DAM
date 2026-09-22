import { FlatList, StyleSheet, View } from 'react-native';

import { EstadoVacio } from '@/src/componentes/estados/EstadoVacio';
import type { LugarCercano } from '@/src/hooks/useLugaresCercanos';
import { TarjetaLugarCercano } from './TarjetaLugarCercano';

interface ListaCercaTuyoProps {
  lugares: LugarCercano[];
  onVerDetalle: (lugar: LugarCercano) => void;
}

/** Lista «Cerca tuyo» ordenada por distancia, en tarjetas (tarea 4). */
export function ListaCercaTuyo({ lugares, onVerDetalle }: ListaCercaTuyoProps) {
  if (lugares.length === 0) {
    return <EstadoVacio icono="location-outline" titulo="No hay lugares para esta categoría" />;
  }

  return (
    <FlatList
      data={lugares}
      keyExtractor={(lugar) => lugar.id}
      renderItem={({ item }) => <TarjetaLugarCercano lugar={item} onVerDetalle={onVerDetalle} />}
      ItemSeparatorComponent={() => <View style={styles.separador} />}
      contentContainerStyle={styles.contenido}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  contenido: {
    paddingVertical: 8,
  },
  separador: {
    height: 10,
  },
});
