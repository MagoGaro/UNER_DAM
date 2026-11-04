import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvisoBanner } from '@/src/componentes/estados/AvisoBanner';
import { Boton } from '@/src/componentes/estados/Boton';
import { EstadoVacio } from '@/src/componentes/estados/EstadoVacio';
import { EtiquetaOrigen } from '@/src/componentes/recorrido/EtiquetaOrigen';
import { SelectorFoto } from '@/src/componentes/recorrido/SelectorFoto';
import { COLORES } from '@/src/configuracion/tema';
import { useCatalogoLugares } from '@/src/hooks/useCatalogoLugares';
import { useCategorias } from '@/src/hooks/useCategorias';
import { rutaDetalleVisita } from '@/src/navegacion/rutas';
import { LARGO_MAXIMO_NOTA, recorrido } from '@/src/recorrido';
import { RADIO_REGISTRO_GPS_METROS } from '@/src/recorrido/cercania';
import { buscarCategoria } from '@/src/servicios/categorias';
import { MENSAJE_PROBLEMA_SERVIDOR, TITULO_PROBLEMA_SERVIDOR } from '@/src/servicios/api/mensajes';
import type { OrigenVisita } from '@/src/tipos/visita';
import { desdeISO, formatearHora } from '@/src/utils/fechas';
import { distanciaMetros } from '@/src/utils/geo';

const ORIGENES_VALIDOS: OrigenVisita[] = ['qr', 'gps', 'manual'];

/** Último paso: foto y nota opcionales, y "Registrar visita". */
export function ConfirmarVisitaPantalla({ lugarId, origen: origenParam }: { lugarId?: string; origen?: string }) {
  const { porId, estado: estadoCatalogo, reintentar } = useCatalogoLugares();
  const { categorias } = useCategorias();
  const lugar = lugarId ? porId[lugarId] : undefined;
  const [origen, setOrigen] = useState<OrigenVisita>(
    ORIGENES_VALIDOS.includes(origenParam as OrigenVisita) ? (origenParam as OrigenVisita) : 'manual'
  );
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [nota, setNota] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si eligió a mano pero en realidad está al lado del lugar, se registra como "gps"
  // (sin pedir permiso de nuevo: solo si ya lo había dado).
  useEffect(() => {
    if (origen !== 'manual' || !lugar) return;
    let vivo = true;
    Location.getForegroundPermissionsAsync()
      .then(async (p) => {
        if (!p.granted) return;
        const u = await Location.getLastKnownPositionAsync({ maxAge: 120_000 });
        if (!vivo || !u) return;
        const d = distanciaMetros({ latitud: u.coords.latitude, longitud: u.coords.longitude }, lugar.coordenadas);
        if (d <= RADIO_REGISTRO_GPS_METROS && (u.coords.accuracy ?? 999) <= 100) setOrigen('gps');
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [origen, lugar]);

  if (!lugar) {
    return (
      <View style={styles.centro}>
        <Stack.Screen options={{ title: 'Registrar visita' }} />
        {estadoCatalogo === 'cargando' ? (
          <ActivityIndicator size="large" color={COLORES.primario} />
        ) : estadoCatalogo === 'error' ? (
          <EstadoVacio
            icono="cloud-offline-outline"
            titulo={TITULO_PROBLEMA_SERVIDOR}
            descripcion={MENSAJE_PROBLEMA_SERVIDOR}
            textoBoton="Reintentar"
            onPresionarBoton={reintentar}
          />
        ) : (
          <EstadoVacio
            icono="help-circle-outline"
            titulo="No encontramos ese lugar en la guía"
            textoBoton="Volver"
            onPresionarBoton={() => router.back()}
          />
        )}
      </View>
    );
  }

  const yaHoy = recorrido.visitaDeHoy(lugar.id);
  const cat = buscarCategoria(categorias, lugar.categoriaId);

  async function registrar() {
    if (!lugar) return;
    setGuardando(true);
    setError(null);
    try {
      const visita = await recorrido.registrar({ lugarId: lugar.id, origen, fotoUri, nota });
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.replace({ pathname: '/visita/[id]', params: { id: visita.id, nueva: '1' } });
    } catch {
      setError('No pudimos guardar la visita en el teléfono. Probá de nuevo.');
      setGuardando(false);
    }
  }

  return (
    <SafeAreaView style={styles.contenedor} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Registrar visita' }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.lugar}>
            {lugar.imagenes[0] ? (
              <Image source={{ uri: lugar.imagenes[0] }} style={styles.miniatura} contentFit="cover" cachePolicy="disk" />
            ) : null}
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.categoria}>{cat?.nombre ?? 'Lugar'}</Text>
              <Text style={styles.nombre}>{lugar.nombre}</Text>
              <EtiquetaOrigen origen={origen} />
            </View>
          </View>

          {yaHoy ? (
            <AvisoBanner
              tono="info"
              texto={`Ya registraste este lugar hoy a las ${formatearHora(desdeISO(yaHoy.fechaHora) ?? new Date())}. Podés registrarlo otra vez o ver esa visita.`}
            />
          ) : null}
          {yaHoy ? (
            <Boton texto="Ver la visita de hoy" variante="secundario" icono="eye-outline" onPress={() => router.replace(rutaDetalleVisita(yaHoy.id))} />
          ) : null}

          <Text style={styles.seccion}>Foto (opcional)</Text>
          <SelectorFoto uri={fotoUri} onCambiar={setFotoUri} />

          <Text style={styles.seccion}>Nota (opcional)</Text>
          <TextInput
            value={nota}
            onChangeText={setNota}
            placeholder="¿Qué te pareció? Ej.: «Hacía 38 grados pero valió la pena»"
            placeholderTextColor={COLORES.textoTenue}
            style={styles.nota}
            multiline
            maxLength={LARGO_MAXIMO_NOTA}
            accessibilityLabel="Nota de la visita"
            textAlignVertical="top"
          />
          <Text style={styles.contador}>
            {nota.length}/{LARGO_MAXIMO_NOTA}
          </Text>

          {error ? <AvisoBanner tono="peligro" texto={error} /> : null}
        </ScrollView>
        <View style={styles.pie}>
          <Boton texto="Registrar visita" icono="checkmark-circle" cargando={guardando} onPress={registrar} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.superficie },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: COLORES.superficie },
  scroll: { padding: 16, gap: 12, paddingBottom: 24 },
  lugar: { flexDirection: 'row', gap: 14, alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: COLORES.fondo },
  miniatura: { width: 84, height: 84, borderRadius: 12, backgroundColor: COLORES.borde },
  categoria: { fontSize: 14, fontWeight: '700', color: COLORES.textoSecundario, textTransform: 'uppercase' },
  nombre: { fontSize: 22, fontWeight: '800', color: COLORES.texto },
  seccion: { fontSize: 18, fontWeight: '800', color: COLORES.texto, marginTop: 6 },
  nota: {
    minHeight: 110,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: 14,
    fontSize: 17,
    color: COLORES.texto,
    backgroundColor: COLORES.superficie,
  },
  contador: { alignSelf: 'flex-end', fontSize: 14, color: COLORES.textoTenue },
  pie: { padding: 16, borderTopWidth: 1, borderTopColor: COLORES.borde, backgroundColor: COLORES.superficie },
});
