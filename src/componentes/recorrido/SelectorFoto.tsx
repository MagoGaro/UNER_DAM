import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Boton } from '@/src/componentes/estados/Boton';
import { COLORES } from '@/src/configuracion/tema';
import { rutaCamara } from '@/src/navegacion/rutas';
import { tomarFoto } from '@/src/recorrido/borradorFoto';
import { elegirFotoDeGaleria } from '@/src/recorrido/elegirFoto';

interface SelectorFotoProps {
  uri: string | null;
  onCambiar: (uri: string | null) => void;
}

/**
 * Sacar una foto (expo-camera) o elegir una de la galería
 * (expo-image-picker), con vista previa y opción de quitarla.
 */
export function SelectorFoto({ uri, onCambiar }: SelectorFotoProps) {
  const [aviso, setAviso] = useState<string | null>(null);

  // Al volver de la pantalla de cámara, levantar la foto que dejó.
  useFocusEffect(
    useCallback(() => {
      const nueva = tomarFoto();
      if (nueva) onCambiar(nueva);
    }, [onCambiar])
  );

  async function galeria() {
    setAviso(null);
    const r = await elegirFotoDeGaleria();
    if (r.permisoDenegado) setAviso('Sin permiso para ver tus fotos. Podés sacar una nueva con la cámara.');
    if (r.uri) onCambiar(r.uri);
  }

  if (uri) {
    return (
      <View style={styles.preview}>
        <Image source={{ uri }} style={styles.imagen} contentFit="cover" accessibilityLabel="Foto de la visita" />
        <TouchableOpacity
          onPress={() => onCambiar(null)}
          style={styles.quitar}
          accessibilityRole="button"
          accessibilityLabel="Quitar la foto">
          <Ionicons name="trash-outline" size={22} color="#fff" />
          <Text style={styles.quitarTexto}>Quitar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.botones}>
      <View style={styles.fila}>
        <Boton texto="Sacar foto" icono="camera" variante="secundario" onPress={() => router.push(rutaCamara())} style={{ flex: 1 }} />
        <Boton texto="Galería" icono="images-outline" variante="secundario" onPress={galeria} style={{ flex: 1 }} />
      </View>
      {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  preview: { borderRadius: 14, overflow: 'hidden' },
  imagen: { width: '100%', aspectRatio: 4 / 3, backgroundColor: COLORES.fondo },
  quitar: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  quitarTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  botones: { gap: 8 },
  fila: { flexDirection: 'row', gap: 10 },
  aviso: { fontSize: 15, color: COLORES.aviso, fontWeight: '600' },
});
