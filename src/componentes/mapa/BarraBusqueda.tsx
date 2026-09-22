import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface BarraBusquedaProps {
  valor: string;
  onCambiarValor: (texto: string) => void;
  filtrosVisibles: boolean;
  onCambiarFiltrosVisibles: (visible: boolean) => void;
}

/** Buscador por nombre + botón que muestra/oculta los chips de categoría. */
export const BarraBusqueda = forwardRef<TextInput, BarraBusquedaProps>(function BarraBusqueda(
  { valor, onCambiarValor, filtrosVisibles, onCambiarFiltrosVisibles },
  ref
) {
  return (
    <View style={styles.fila}>
      <View style={styles.campo}>
        <Ionicons name="search" size={18} color="#868E96" />
        <TextInput
          ref={ref}
          value={valor}
          onChangeText={onCambiarValor}
          placeholder="Buscar..."
          placeholderTextColor="#ADB5BD"
          style={styles.input}
          returnKeyType="search"
          accessibilityLabel="Buscar lugares por nombre"
        />
      </View>
      <TouchableOpacity
        onPress={() => onCambiarFiltrosVisibles(!filtrosVisibles)}
        accessibilityRole="button"
        accessibilityState={{ selected: filtrosVisibles }}
        style={[styles.boton, filtrosVisibles && styles.botonActivo]}>
        <Ionicons name="options" size={16} color={filtrosVisibles ? '#fff' : '#495057'} />
        <Text style={[styles.botonTexto, filtrosVisibles && styles.botonTextoActivo]}>Filtro</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  campo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F3F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#212529',
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F1F3F5',
  },
  botonActivo: {
    backgroundColor: '#495057',
  },
  botonTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  botonTextoActivo: {
    color: '#fff',
  },
});
