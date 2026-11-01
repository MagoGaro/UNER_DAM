import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORES } from '@/src/configuracion/tema';

type Tono = 'aviso' | 'peligro' | 'info' | 'exito';

/** Franja de aviso (sin señal, evento suspendido, foto pendiente de subir...). */
export function AvisoBanner({ texto, tono = 'aviso', icono }: { texto: string; tono?: Tono; icono?: ComponentProps<typeof Ionicons>['name'] }) {
  const c = {
    aviso: { fondo: COLORES.avisoClaro, texto: COLORES.aviso, icono: 'cloud-offline-outline' as const },
    peligro: { fondo: COLORES.peligroClaro, texto: COLORES.peligro, icono: 'alert-circle-outline' as const },
    info: { fondo: '#E7F5FF', texto: COLORES.enlace, icono: 'information-circle-outline' as const },
    exito: { fondo: COLORES.exitoClaro, texto: COLORES.exito, icono: 'checkmark-circle-outline' as const },
  }[tono];
  return (
    <View style={[styles.banner, { backgroundColor: c.fondo }]} accessibilityRole="alert">
      <Ionicons name={icono ?? c.icono} size={22} color={c.texto} />
      <Text style={[styles.texto, { color: c.texto }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12 },
  texto: { flex: 1, fontSize: 15, fontWeight: '600' },
});
