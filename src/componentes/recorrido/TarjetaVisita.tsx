import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORES, RADIO } from '@/src/configuracion/tema';
import type { Lugar } from '@/src/tipos/lugar';
import type { Visita } from '@/src/tipos/visita';
import { desdeISO, formatearHora } from '@/src/utils/fechas';
import { EtiquetaOrigen } from './EtiquetaOrigen';

interface TarjetaVisitaProps {
  numero: number;
  visita: Visita;
  lugar: Lugar | null;
  esUltima: boolean;
  onPress: () => void;
}

/** Un paso del recorrido: número, hora, lugar, foto y nota, con la línea de la "ruta". */
export function TarjetaVisita({ numero, visita, lugar, esUltima, onPress }: TarjetaVisitaProps) {
  const fecha = desdeISO(visita.fechaHora);
  const nombre = lugar?.nombre ?? 'Lugar que ya no está en la guía';
  return (
    <View style={styles.fila}>
      <View style={styles.linea}>
        <View style={styles.numero}>
          <Text style={styles.numeroTexto}>{numero}</Text>
        </View>
        {!esUltima ? <View style={styles.trazo} /> : null}
      </View>

      <TouchableOpacity
        style={styles.tarjeta}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Visita ${numero}: ${nombre}, ${fecha ? formatearHora(fecha) : ''}${visita.fotoUri ? ', con foto' : ''}${visita.sincronizada ? '' : ', pendiente de subir'}`}>
        <View style={styles.encabezado}>
          <Text style={styles.hora}>{fecha ? formatearHora(fecha) : '--:--'}</Text>
          {!visita.sincronizada ? (
            <View style={styles.pendiente}>
              <Ionicons name="cloud-upload-outline" size={16} color={COLORES.aviso} />
              <Text style={styles.pendienteTexto}>Sin subir</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.nombre} numberOfLines={2}>
          {nombre}
        </Text>
        <EtiquetaOrigen origen={visita.origen} />
        {visita.fotoUri ? (
          <Image source={{ uri: visita.fotoUri }} style={styles.foto} contentFit="cover" accessibilityIgnoresInvertColors />
        ) : null}
        {visita.nota ? (
          <Text style={styles.nota} numberOfLines={3}>
            “{visita.nota}”
          </Text>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', gap: 10 },
  linea: { width: 34, alignItems: 'center' },
  numero: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORES.primario,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroTexto: { color: '#fff', fontWeight: '800', fontSize: 16 },
  trazo: { flex: 1, width: 3, backgroundColor: '#F3C9AE', marginVertical: 4 },
  tarjeta: {
    flex: 1,
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: 14,
    gap: 6,
    marginBottom: 14,
  },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hora: { fontSize: 15, fontWeight: '700', color: COLORES.textoSecundario },
  pendiente: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pendienteTexto: { fontSize: 13, fontWeight: '700', color: COLORES.aviso },
  nombre: { fontSize: 18, fontWeight: '800', color: COLORES.texto },
  foto: { width: '100%', aspectRatio: 4 / 3, borderRadius: 10, marginTop: 4, backgroundColor: COLORES.fondo },
  nota: { fontSize: 16, color: COLORES.textoSecundario, fontStyle: 'italic' },
});
