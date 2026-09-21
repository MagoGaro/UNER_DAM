import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

/**
 * Placeholder de la pantalla de detalle: la desarrolla el Integrante 1
 * (Lugares + Audioguías). Existe para que la navegación desde el mapa y
 * la lista «Cerca tuyo» de esta parte sea funcional de punta a punta
 * mientras tanto; reemplazar por la pantalla real cuando esté lista.
 */
export default function DetalleLugarPantalla() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ThemedView style={styles.contenedor}>
      <ThemedText type="title">Detalle del lugar</ThemedText>
      <ThemedText>id: {id}</ThemedText>
      <ThemedText style={styles.nota}>
        Pantalla pendiente (Integrante 1: Lugares + Audioguías).
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: 24,
    gap: 8,
  },
  nota: {
    opacity: 0.7,
  },
});
