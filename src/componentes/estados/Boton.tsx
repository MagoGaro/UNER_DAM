import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, type ViewStyle } from 'react-native';

import { ALTO_BOTON, COLORES } from '@/src/configuracion/tema';

type Variante = 'primario' | 'secundario' | 'peligro';

interface BotonProps {
  texto: string;
  onPress: () => void;
  icono?: ComponentProps<typeof Ionicons>['name'];
  variante?: Variante;
  cargando?: boolean;
  deshabilitado?: boolean;
  accessibilityHint?: string;
  style?: ViewStyle;
}

/** Botón grande (≥ 52 px) y de alto contraste, pensado para usar con una mano al sol. */
export function Boton({ texto, onPress, icono, variante = 'primario', cargando, deshabilitado, accessibilityHint, style }: BotonProps) {
  const colores = {
    primario: { fondo: COLORES.primario, texto: '#fff', borde: COLORES.primario },
    secundario: { fondo: COLORES.superficie, texto: COLORES.texto, borde: COLORES.borde },
    peligro: { fondo: COLORES.superficie, texto: COLORES.peligro, borde: COLORES.peligro },
  }[variante];
  const inactivo = deshabilitado || cargando;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      accessibilityHint={accessibilityHint}
      style={[
        styles.boton,
        { backgroundColor: colores.fondo, borderColor: colores.borde },
        inactivo && styles.inactivo,
        style,
      ]}>
      {cargando ? (
        <ActivityIndicator color={colores.texto} />
      ) : icono ? (
        <Ionicons name={icono} size={22} color={colores.texto} />
      ) : null}
      <Text style={[styles.texto, { color: colores.texto }]}>{texto}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  boton: {
    minHeight: ALTO_BOTON,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  inactivo: { opacity: 0.55 },
  texto: { fontSize: 17, fontWeight: '800', flexShrink: 1, textAlign: 'center' },
});
