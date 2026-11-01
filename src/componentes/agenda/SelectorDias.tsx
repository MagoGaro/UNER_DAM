import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORES } from '@/src/configuracion/tema';
import { claveDia, etiquetaDiaCorta } from '@/src/utils/fechas';

interface SelectorDiasProps {
  dias: Date[];
  hoy: Date;
  seleccionado: string;
  cantidadPorDia: Record<string, number>;
  onSeleccionar: (clave: string) => void;
}

/** Tira horizontal de días, empezando por hoy. Marca con un punto los días con eventos. */
export function SelectorDias({ dias, hoy, seleccionado, cantidadPorDia, onSeleccionar }: SelectorDiasProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fila}>
      {dias.map((dia) => {
        const clave = claveDia(dia);
        const activo = clave === seleccionado;
        const { titulo, subtitulo } = etiquetaDiaCorta(dia, hoy);
        const cantidad = cantidadPorDia[clave] ?? 0;
        return (
          <TouchableOpacity
            key={clave}
            onPress={() => onSeleccionar(clave)}
            accessibilityRole="button"
            accessibilityState={{ selected: activo }}
            accessibilityLabel={`${titulo} ${subtitulo}, ${cantidad === 0 ? 'sin eventos' : `${cantidad} eventos`}`}
            style={[styles.dia, activo && styles.diaActivo]}>
            <Text style={[styles.titulo, activo && styles.textoActivo]}>{titulo}</Text>
            <Text style={[styles.subtitulo, activo && styles.textoActivo]}>{subtitulo}</Text>
            <View style={[styles.punto, cantidad === 0 && styles.puntoVacio, activo && styles.puntoActivo]} />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fila: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  dia: {
    minWidth: 72,
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.borde,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  diaActivo: { backgroundColor: COLORES.primario, borderColor: COLORES.primario },
  titulo: { fontSize: 16, fontWeight: '800', color: COLORES.texto, textTransform: 'capitalize' },
  subtitulo: { fontSize: 13, color: COLORES.textoSecundario },
  textoActivo: { color: '#fff' },
  punto: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORES.primario, marginTop: 2 },
  puntoVacio: { backgroundColor: 'transparent' },
  puntoActivo: { backgroundColor: '#fff' },
});
