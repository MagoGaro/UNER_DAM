import { FlatList, StyleSheet, View } from 'react-native';

import type { LugarCercano } from '@/src/hooks/useLugaresCercanos';
import { EstadoVacio } from '@/src/componentes/estados/EstadoVacio';
import { ItemLugarCercano } from './ItemLugarCercano';

interface ListaCercaTuyoProps {
  lugares: LugarCercano[];
  onVerDetalle: (lugar: LugarCercano) => void;
}

/** Lista «Cerca tuyo» ordenada por distancia (tarea 4). */
export function ListaCercaTuyo({ lugares, onVerDetalle }: ListaCercaTuyoProps) {
  if (lugares.length === 0) {
    return <EstadoVacio icono="location-outline" titulo="No hay lugares para esta categoría" />;
  }

  return (
    <FlatList
      data={lugares}
      keyExtractor={(lugar) => lugar.id}
      renderItem={({ item }) => <ItemLugarCercano lugar={item} onVerDetalle={onVerDetalle} />}
      ItemSeparatorComponent={() => <View style={styles.separador} />}
    />
  );
}

const styles = StyleSheet.create({
  separador: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#DEE2E6',
    marginLeft: 64,
  },
});
