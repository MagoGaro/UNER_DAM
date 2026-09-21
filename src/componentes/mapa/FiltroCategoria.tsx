import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { CATEGORIAS, type Categoria, obtenerMetadatoCategoria } from '@/src/tipos/categoria';

interface FiltroCategoriaProps {
  categoriaSeleccionada: Categoria | null;
  onCambiarCategoria: (categoria: Categoria | null) => void;
}

/** Chips horizontales para filtrar el mapa y la lista por categoría (tarea 2). */
export function FiltroCategoria({ categoriaSeleccionada, onCambiarCategoria }: FiltroCategoriaProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contenedor}>
      <Chip
        etiqueta="Todos"
        color="#495057"
        icono="apps"
        seleccionado={categoriaSeleccionada === null}
        onPress={() => onCambiarCategoria(null)}
      />
      {CATEGORIAS.map((categoria) => {
        const metadato = obtenerMetadatoCategoria(categoria);
        return (
          <Chip
            key={categoria}
            etiqueta={metadato.etiqueta}
            color={metadato.color}
            icono={metadato.icono}
            seleccionado={categoriaSeleccionada === categoria}
            onPress={() => onCambiarCategoria(categoria)}
          />
        );
      })}
    </ScrollView>
  );
}

interface ChipProps {
  etiqueta: string;
  color: string;
  icono: ComponentProps<typeof Ionicons>['name'];
  seleccionado: boolean;
  onPress: () => void;
}

function Chip({ etiqueta, color, icono, seleccionado, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: seleccionado }}
      style={[styles.chip, { backgroundColor: seleccionado ? color : '#F1F3F5' }]}>
      <Ionicons name={icono} size={16} color={seleccionado ? '#fff' : color} />
      <Text
        style={[styles.etiqueta, { color: seleccionado ? '#fff' : '#343A40' }]}
        numberOfLines={1}>
        {etiqueta}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
  },
});
