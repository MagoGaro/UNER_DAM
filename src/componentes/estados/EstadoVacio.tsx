import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EstadoVacioProps {
  icono: ComponentProps<typeof Ionicons>['name'];
  titulo: string;
  descripcion?: string;
  textoBoton?: string;
  onPresionarBoton?: () => void;
}

/**
 * Mensaje reutilizable para los estados sin datos que pide el
 * seguimiento: categoría sin lugares, error de red con reintento, y
 * ubicación denegada.
 */
export function EstadoVacio({ icono, titulo, descripcion, textoBoton, onPresionarBoton }: EstadoVacioProps) {
  return (
    <View style={styles.contenedor}>
      <Ionicons name={icono} size={40} color="#868E96" />
      <Text style={styles.titulo}>{titulo}</Text>
      {descripcion ? <Text style={styles.descripcion}>{descripcion}</Text> : null}
      {textoBoton && onPresionarBoton ? (
        <TouchableOpacity style={styles.boton} onPress={onPresionarBoton} accessibilityRole="button">
          <Text style={styles.textoBoton}>{textoBoton}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    textAlign: 'center',
  },
  descripcion: {
    fontSize: 14,
    color: '#868E96',
    textAlign: 'center',
  },
  boton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#339AF0',
  },
  textoBoton: {
    color: '#fff',
    fontWeight: '600',
  },
});
