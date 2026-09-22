import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PantallaPendienteProps {
  titulo: string;
  responsable: string;
  icono: ComponentProps<typeof Ionicons>['name'];
}

/**
 * Placeholder para una sección de la barra de tabs que todavía no
 * desarrolló su responsable, para que la navegación completa de la app
 * (Mapa / Agenda / Mi recorrido / Yo) sea funcional mientras cada
 * integrante entrega su parte.
 */
export function PantallaPendiente({ titulo, responsable, icono }: PantallaPendienteProps) {
  return (
    <SafeAreaView style={styles.contenedor}>
      <Ionicons name={icono} size={40} color="#ADB5BD" />
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.responsable}>Pantalla pendiente ({responsable})</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#343A40',
  },
  responsable: {
    fontSize: 13,
    color: '#868E96',
  },
});
