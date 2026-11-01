import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORES } from '@/src/configuracion/tema';
import type { OrigenVisita } from '@/src/tipos/visita';

export const ORIGENES: Record<OrigenVisita, { texto: string; icono: ComponentProps<typeof Ionicons>['name'] }> = {
  qr: { texto: 'Escaneaste el QR', icono: 'qr-code-outline' },
  gps: { texto: 'Estabas acá (GPS)', icono: 'locate-outline' },
  manual: { texto: 'Cargada a mano', icono: 'create-outline' },
};

export function EtiquetaOrigen({ origen }: { origen: OrigenVisita }) {
  const o = ORIGENES[origen];
  return (
    <View style={styles.chip}>
      <Ionicons name={o.icono} size={15} color={COLORES.textoSecundario} />
      <Text style={styles.texto}>{o.texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  texto: { fontSize: 13, fontWeight: '600', color: COLORES.textoSecundario },
});
