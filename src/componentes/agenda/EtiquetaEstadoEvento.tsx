import { StyleSheet, Text, View } from 'react-native';

import { ETIQUETAS_ESTADO } from '@/src/agenda/logicaAgenda';
import type { EstadoEvento } from '@/src/tipos/evento';

/** Chip "Suspendido" / "Cancelado" / "Finalizado". El estado programado no se muestra. */
export function EtiquetaEstadoEvento({ estado, mostrarProgramado = false }: { estado: EstadoEvento; mostrarProgramado?: boolean }) {
  if (estado === 'programado' && !mostrarProgramado) return null;
  const e = ETIQUETAS_ESTADO[estado];
  return (
    <View style={[styles.chip, { backgroundColor: e.fondo }]}>
      <Text style={[styles.texto, { color: e.color }]}>{e.texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  texto: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
});
