import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/src/componentes/estados/Boton';
import { COLORES } from '@/src/configuracion/tema';
import { useCatalogoLugares } from '@/src/hooks/useCatalogoLugares';
import { rutaConfirmarVisita, rutaElegirLugar } from '@/src/navegacion/rutas';
import { interpretarCodigoQr } from '@/src/recorrido/codigoQr';
import { MENSAJE_PROBLEMA_SERVIDOR } from '@/src/servicios/api/mensajes';
import { servicioLugares } from '@/src/servicios/lugares';

const SEGUNDOS_PARA_AYUDA = 15;
const PAUSA_ENTRE_AVISOS_MS = 2500;

/**
 * Registrar visita escaneando el QR del cartel (expo-camera, CameraView).
 * Un QR ajeno o roto muestra un aviso y la cámara sigue leyendo: nunca
 * se rompe ni se queda colgada.
 */
export function EscanearQrPantalla() {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const { porId, lugares, estado: estadoCatalogo } = useCatalogoLugares();
  const [aviso, setAviso] = useState<string | null>(null);
  const [linterna, setLinterna] = useState(false);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const procesando = useRef(false);
  const ultimoTexto = useRef<{ texto: string; cuando: number } | null>(null);
  const temporizadorAviso = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setMostrarAyuda(true), SEGUNDOS_PARA_AYUDA * 1000);
    return () => {
      clearTimeout(id);
      if (temporizadorAviso.current) clearTimeout(temporizadorAviso.current);
    };
  }, []);

  function avisar(texto: string) {
    setAviso(texto);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    if (temporizadorAviso.current) clearTimeout(temporizadorAviso.current);
    temporizadorAviso.current = setTimeout(() => setAviso(null), 4000);
  }

  function irAConfirmar(lugarId: string) {
    procesando.current = true;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.replace(rutaConfirmarVisita(lugarId, 'qr'));
  }

  async function alLeer({ data }: BarcodeScanningResult) {
    if (procesando.current) return;
    const ahora = Date.now();
    // La cámara dispara el mismo código muchas veces por segundo: se ignora el repetido.
    if (
      ultimoTexto.current &&
      ultimoTexto.current.texto === data &&
      ahora - ultimoTexto.current.cuando < PAUSA_ENTRE_AVISOS_MS
    ) {
      return;
    }
    ultimoTexto.current = { texto: data, cuando: ahora };

    const r = interpretarCodigoQr(data);
    if (r.tipo !== 'valido') {
      avisar(r.mensaje);
      return;
    }
    if (estadoCatalogo === 'error' && lugares.length === 0) {
      avisar(MENSAJE_PROBLEMA_SERVIDOR);
      return;
    }
    if (estadoCatalogo !== 'listo' && lugares.length === 0) {
      avisar('Estamos cargando la guía, probá de nuevo en un segundo.');
      return;
    }
    const lugar = porId[r.lugarId];
    if (lugar) {
      irAConfirmar(lugar.id);
      return;
    }
    procesando.current = true;
    try {
      const remoto = await servicioLugares.obtenerPorQr(r.codigo);
      if (!remoto) {
        procesando.current = false;
        avisar('Este cartel es de un lugar que ya no está en la guía.');
        return;
      }
      irAConfirmar(remoto.id);
    } catch {
      procesando.current = false;
      avisar(MENSAJE_PROBLEMA_SERVIDOR);
    }
  }

  if (!permiso) {
    return (
      <View style={styles.centro}>
        <Stack.Screen options={{ title: 'Escanear QR' }} />
        <ActivityIndicator size="large" color={COLORES.primario} />
      </View>
    );
  }

  if (!permiso.granted) {
    return (
      <SafeAreaView style={styles.permiso} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Escanear QR' }} />
        <View style={{ alignItems: 'center' }}>
          <Ionicons name="camera-outline" size={64} color={COLORES.primario} />
        </View>
        <Text style={styles.permisoTitulo}>Necesitamos la cámara para leer el QR</Text>
        <Text style={styles.permisoTexto}>
          Solo la usamos mientras estás en esta pantalla. Si preferís, podés elegir el lugar a mano.
        </Text>
        {permiso.canAskAgain ? (
          <Boton texto="Permitir la cámara" icono="camera" onPress={() => pedirPermiso()} />
        ) : (
          <Boton
            texto="Abrir configuración"
            icono="settings-outline"
            onPress={() => Linking.openSettings().catch(() => {})}
          />
        )}
        <Boton
          texto="Elegir el lugar a mano"
          variante="secundario"
          icono="list"
          onPress={() => router.replace(rutaElegirLugar('manual'))}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Stack.Screen
        options={{ title: 'Escanear QR', headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff' }}
      />
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={linterna}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={alLeer}
      />
      <View style={styles.capa} pointerEvents="box-none">
        <Text style={styles.instruccion}>Apuntá al código QR del cartel</Text>
        <View style={styles.marco} accessibilityElementsHidden importantForAccessibility="no" />
        <View style={styles.inferior} pointerEvents="box-none">
          {aviso ? (
            <View style={styles.aviso} accessibilityLiveRegion="assertive" accessibilityRole="alert">
              <Ionicons name="alert-circle" size={22} color={COLORES.aviso} />
              <Text style={styles.avisoTexto}>{aviso}</Text>
            </View>
          ) : null}
          <SafeAreaView edges={['bottom']} style={styles.pie}>
            <TouchableOpacity
              onPress={() => setLinterna((l) => !l)}
              style={styles.botonRedondo}
              accessibilityRole="button"
              accessibilityLabel={linterna ? 'Apagar linterna' : 'Prender linterna'}>
              <Ionicons name={linterna ? 'flash' : 'flash-outline'} size={28} color="#fff" />
            </TouchableOpacity>
            {mostrarAyuda ? (
              <Boton
                texto="¿No lee? Elegir a mano"
                variante="secundario"
                icono="list"
                onPress={() => router.replace(rutaElegirLugar('manual'))}
                style={{ flex: 1 }}
              />
            ) : null}
          </SafeAreaView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#000' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  permiso: {
    flex: 1,
    padding: 24,
    gap: 14,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: COLORES.superficie,
  },
  permisoTitulo: { fontSize: 22, fontWeight: '800', color: COLORES.texto, textAlign: 'center' },
  permisoTexto: { fontSize: 16, color: COLORES.textoSecundario, textAlign: 'center', marginBottom: 8 },
  capa: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingTop: 24 },
  instruccion: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    overflow: 'hidden',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  marco: { width: 250, height: 250, borderWidth: 4, borderColor: '#fff', borderRadius: 24 },
  inferior: { alignSelf: 'stretch', gap: 8 },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORES.avisoClaro,
  },
  avisoTexto: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORES.aviso },
  pie: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  botonRedondo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
