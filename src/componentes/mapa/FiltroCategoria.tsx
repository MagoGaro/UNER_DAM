import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { iconoCategoria } from '@/src/tipos/categoria';

interface FiltroCategoriaProps {
  categorias: { id: string; nombre: string; icono: string; color: string }[];
  categoriaSeleccionada: string | null;
  onCambiarCategoria: (categoriaId: string | null) => void;
}

/**
 * Chips horizontales para filtrar el mapa y la lista por categoría
 * (tarea 2). Cada chip va siempre relleno con su color; el seleccionado
 * se marca con un anillo blanco, para no depender de un estado "gris"
 * que el mockup de diseño no usa.
 */
export function FiltroCategoria({ categorias, categoriaSeleccionada, onCambiarCategoria }: FiltroCategoriaProps) {
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
      {categorias.map((categoria) => (
          <Chip
            key={categoria.id}
            etiqueta={categoria.nombre}
            color={categoria.color}
            icono={iconoCategoria(categoria.icono)}
            seleccionado={categoriaSeleccionada === categoria.id}
            onPress={() => onCambiarCategoria(categoria.id)}
          />
        ))}
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
      style={[styles.chip, { backgroundColor: color }, seleccionado && styles.chipSeleccionado]}>
      <Ionicons name={icono} size={16} color="#fff" />
      <Text style={styles.etiqueta} numberOfLines={1}>
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSeleccionado: {
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
