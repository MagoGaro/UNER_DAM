import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router, Stack } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/src/componentes/estados/Boton';
import { COLORES } from '@/src/configuracion/tema';
import { dejarFoto } from '@/src/recorrido/borradorFoto';

/** Sacar la foto de la visita con expo-camera (CameraView). */
export function CamaraPantalla() {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const camara = useRef<CameraView>(null);
  const [lado, setLado] = useState<CameraType>('back');
  const [lista, setLista] = useState(false);
  const [sacando, setSacando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sacar() {
    if (!camara.current || sacando) return;
    setSacando(true);
    setError(null);
    try {
      const foto = await camara.current.takePictureAsync({ quality: 0.7, skipProcessing: false });
      if (foto?.uri) {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        dejarFoto(foto.uri);
        router.back();
        return;
      }
      setError('No se pudo sacar la foto. Probá de nuevo.');
    } catch {
      setError('No se pudo sacar la foto. Probá de nuevo.');
    } finally {
      setSacando(false);
    }
  }

  if (!permiso) {
    return (
      <View style={styles.centro}>
        <Stack.Screen options={{ title: 'Foto' }} />
        <ActivityIndicator size="large" color={COLORES.primario} />
      </View>
    );
  }

  if (!permiso.granted) {
    return (
      <SafeAreaView style={styles.permiso} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Foto' }} />
        <Text style={styles.permisoTitulo}>Necesitamos la cámara para sacar la foto</Text>
        {permiso.canAskAgain ? (
          <Boton texto="Permitir la cámara" icono="camera" onPress={() => pedirPermiso()} />
        ) : (
          <Boton texto="Abrir configuración" icono="settings-outline" onPress={() => Linking.openSettings().catch(() => {})} />
        )}
        <Boton texto="Volver" variante="secundario" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Stack.Screen options={{ title: 'Foto de la visita', headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff' }} />
      <CameraView ref={camara} style={StyleSheet.absoluteFill} facing={lado} onCameraReady={() => setLista(true)} />
      <SafeAreaView edges={['bottom']} style={styles.pie}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.controles}>
          <View style={styles.hueco} />
          <TouchableOpacity
            onPress={sacar}
            disabled={!lista || sacando}
            style={[styles.disparador, (!lista || sacando) && { opacity: 0.5 }]}
            accessibilityRole="button"
            accessibilityLabel="Sacar foto">
            {sacando ? <ActivityIndicator color={COLORES.primario} /> : <View style={styles.disparadorInterno} />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLado((l) => (l === 'back' ? 'front' : 'back'))}
            style={styles.botonRedondo}
            accessibilityRole="button"
            accessibilityLabel="Cambiar de cámara">
            <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#000', justifyContent: 'flex-end' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  permiso: { flex: 1, padding: 24, gap: 14, justifyContent: 'center', backgroundColor: COLORES.superficie },
  permisoTitulo: { fontSize: 22, fontWeight: '800', color: COLORES.texto, textAlign: 'center' },
  pie: { paddingHorizontal: 24, paddingBottom: 16, gap: 10 },
  error: {
    color: '#fff',
    backgroundColor: 'rgba(179,38,30,0.9)',
    padding: 10,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  controles: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hueco: { width: 60 },
  disparador: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disparadorInterno: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' },
  botonRedondo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
