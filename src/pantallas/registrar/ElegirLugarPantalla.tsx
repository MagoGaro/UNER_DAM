import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { router, Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvisoBanner } from '@/src/componentes/estados/AvisoBanner';
import { Boton } from '@/src/componentes/estados/Boton';
import { EstadoVacio } from '@/src/componentes/estados/EstadoVacio';
import { COLORES } from '@/src/configuracion/tema';
import { useCatalogoLugares } from '@/src/hooks/useCatalogoLugares';
import { rutaConfirmarVisita, rutaElegirLugar } from '@/src/navegacion/rutas';
import {
  lugaresParaRegistrar,
  ordenarPorDistancia,
  PRECISION_MAXIMA_METROS,
  RADIO_REGISTRO_GPS_METROS,
  type LugarConDistancia,
} from '@/src/recorrido/cercania';
import { obtenerMetadatoCategoria } from '@/src/tipos/categoria';
import type { Coordenadas } from '@/src/tipos/coordenadas';
import type { Lugar } from '@/src/tipos/lugar';
import { formatearDistancia } from '@/src/utils/geo';

type EstadoGps =
  | { tipo: 'buscando' }
  | { tipo: 'denegado' }
  | { tipo: 'sin-senal' }
  | { tipo: 'impreciso'; precision: number }
  | { tipo: 'listo'; posicion: Coordenadas };

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Ubicación de una sola vez, con tope de tiempo: dentro de El Palmar el GPS puede tardar. */
async function obtenerPosicionUnaVez(): Promise<EstadoGps> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { tipo: 'denegado' };
    const conTope = <T,>(p: Promise<T>, ms: number) =>
      Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);
    const actual = await conTope(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }), 15_000);
    const ubicacion = actual ?? (await Location.getLastKnownPositionAsync({ maxAge: 120_000 }));
    if (!ubicacion) return { tipo: 'sin-senal' };
    const precision = ubicacion.coords.accuracy ?? 0;
    if (precision > PRECISION_MAXIMA_METROS) return { tipo: 'impreciso', precision };
    return { tipo: 'listo', posicion: { latitud: ubicacion.coords.latitude, longitud: ubicacion.coords.longitude } };
  } catch {
    return { tipo: 'sin-senal' };
  }
}

/**
 * Dos formas de registrar sin QR:
 * - `gps`: "Estoy acá" — busca los lugares a menos de 150 m.
 * - `manual`: lista con buscador de todos los lugares de la guía.
 */
export function ElegirLugarPantalla({ modo }: { modo: 'manual' | 'gps' }) {
  const { lugares, estado: estadoCatalogo, reintentar } = useCatalogoLugares();
  const [gps, setGps] = useState<EstadoGps>({ tipo: 'buscando' });
  const [busqueda, setBusqueda] = useState('');

  const buscarPosicion = useCallback(() => {
    setGps({ tipo: 'buscando' });
    obtenerPosicionUnaVez().then(setGps);
  }, []);

  // En modo manual también se intenta la ubicación (sin insistir) para ordenar por cercanía.
  useEffect(() => {
    if (modo === 'gps') {
      buscarPosicion();
      return;
    }
    let vivo = true;
    Location.getForegroundPermissionsAsync()
      .then(async (p) => {
        if (!p.granted) return;
        const u = await Location.getLastKnownPositionAsync({ maxAge: 300_000 });
        if (vivo && u) setGps({ tipo: 'listo', posicion: { latitud: u.coords.latitude, longitud: u.coords.longitude } });
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [modo, buscarPosicion]);

  const posicion = gps.tipo === 'listo' ? gps.posicion : null;

  const listaManual = useMemo<(LugarConDistancia | { lugar: Lugar; distanciaMetros: null })[]>(() => {
    const q = normalizar(busqueda);
    const filtrados = lugares.filter((l) => !q || normalizar(l.nombre).includes(q) || normalizar(l.direccion).includes(q));
    if (posicion) return ordenarPorDistancia(posicion, filtrados);
    return [...filtrados]
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      .map((lugar) => ({ lugar, distanciaMetros: null }));
  }, [lugares, busqueda, posicion]);

  const cercania = useMemo(() => (posicion ? lugaresParaRegistrar(posicion, lugares) : null), [posicion, lugares]);

  const elegir = (lugar: Lugar, origen: 'gps' | 'manual') => router.replace(rutaConfirmarVisita(lugar.id, origen));

  const titulo = modo === 'gps' ? 'Estoy acá' : 'Elegir lugar';

  if (estadoCatalogo === 'cargando' && lugares.length === 0) {
    return (
      <View style={styles.centro}>
        <Stack.Screen options={{ title: titulo }} />
        <ActivityIndicator size="large" color={COLORES.primario} />
      </View>
    );
  }
  if (estadoCatalogo === 'error' && lugares.length === 0) {
    return (
      <View style={styles.centro}>
        <Stack.Screen options={{ title: titulo }} />
        <EstadoVacio
          icono="cloud-offline-outline"
          titulo="No pudimos cargar los lugares"
          textoBoton="Reintentar"
          onPresionarBoton={reintentar}
        />
      </View>
    );
  }

  if (modo === 'gps') {
    return (
      <SafeAreaView style={styles.contenedor} edges={['bottom']}>
        <Stack.Screen options={{ title: titulo }} />
        <View style={styles.cuerpoGps}>
          {gps.tipo === 'buscando' ? (
            <View style={styles.centroInterno}>
              <ActivityIndicator size="large" color={COLORES.primario} />
              <Text style={styles.textoGrande}>Buscando dónde estás…</Text>
            </View>
          ) : gps.tipo === 'denegado' ? (
            <MensajeGps
              icono="location-outline"
              titulo="Sin permiso de ubicación"
              texto="Para registrar por cercanía necesitamos tu ubicación. Podés elegir el lugar a mano o escanear el QR."
            />
          ) : gps.tipo === 'sin-senal' ? (
            <MensajeGps
              icono="cloud-offline-outline"
              titulo="No encontramos tu ubicación"
              texto="Puede pasar en lugares cerrados o sin señal. Probá al aire libre o elegí el lugar a mano."
              onReintentar={buscarPosicion}
            />
          ) : gps.tipo === 'impreciso' ? (
            <MensajeGps
              icono="locate-outline"
              titulo="La señal del GPS es débil"
              texto={`Tu ubicación tiene un margen de ±${Math.round(gps.precision)} m, demasiado para saber en qué lugar estás. Probá al aire libre o elegí a mano.`}
              onReintentar={buscarPosicion}
            />
          ) : cercania?.tipo === 'cerca' ? (
            <FlatList
              data={cercania.candidatos}
              keyExtractor={(c) => c.lugar.id}
              ListHeaderComponent={
                <Text style={styles.textoGrande}>
                  {cercania.candidatos.length === 1 ? '¿Estás en este lugar?' : '¿En cuál de estos lugares estás?'}
                </Text>
              }
              contentContainerStyle={{ gap: 10 }}
              renderItem={({ item }) => (
                <FilaLugar lugar={item.lugar} distancia={item.distanciaMetros} onPress={() => elegir(item.lugar, 'gps')} />
              )}
            />
          ) : (
            <MensajeGps
              icono="map-outline"
              titulo="No estás cerca de ningún lugar de la guía"
              texto={
                cercania?.tipo === 'lejos' && cercania.masCercano
                  ? `El más cercano es ${cercania.masCercano.lugar.nombre}, a ${formatearDistancia(cercania.masCercano.distanciaMetros)}. Para registrar por GPS tenés que estar a menos de ${RADIO_REGISTRO_GPS_METROS} m.`
                  : 'Para registrar por GPS tenés que estar al lado del lugar.'
              }
              onReintentar={buscarPosicion}
            />
          )}
        </View>
        <View style={styles.pie}>
          <Boton texto="Elegir el lugar a mano" variante="secundario" icono="list" onPress={() => router.replace(rutaElegirLugar('manual'))} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor} edges={['bottom']}>
      <Stack.Screen options={{ title: titulo }} />
      <View style={styles.buscador}>
        <Ionicons name="search" size={22} color={COLORES.textoSecundario} />
        <TextInput
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar un lugar"
          placeholderTextColor={COLORES.textoTenue}
          style={styles.input}
          accessibilityLabel="Buscar un lugar por nombre"
          returnKeyType="search"
          autoCorrect={false}
        />
        {busqueda ? (
          <TouchableOpacity onPress={() => setBusqueda('')} accessibilityLabel="Borrar búsqueda" hitSlop={12}>
            <Ionicons name="close-circle" size={22} color={COLORES.textoTenue} />
          </TouchableOpacity>
        ) : null}
      </View>
      <FlatList
        data={listaManual}
        keyExtractor={(i) => i.lugar.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.lista}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <FilaLugar
            lugar={item.lugar}
            distancia={item.distanciaMetros}
            onPress={() =>
              elegir(item.lugar, item.distanciaMetros !== null && item.distanciaMetros <= RADIO_REGISTRO_GPS_METROS ? 'gps' : 'manual')
            }
          />
        )}
        ListEmptyComponent={<EstadoVacio icono="search-outline" titulo={`No hay lugares que coincidan con «${busqueda}»`} />}
      />
    </SafeAreaView>
  );
}

function FilaLugar({ lugar, distancia, onPress }: { lugar: Lugar; distancia: number | null; onPress: () => void }) {
  const meta = obtenerMetadatoCategoria(lugar.categoriaId);
  return (
    <TouchableOpacity
      style={styles.fila}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${lugar.nombre}${distancia !== null ? `, a ${formatearDistancia(distancia)}` : ''}`}>
      <View style={[styles.icono, { backgroundColor: meta.color }]}>
        <Ionicons name={meta.icono} size={22} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.nombre} numberOfLines={2}>
          {lugar.nombre}
        </Text>
        <Text style={styles.detalle} numberOfLines={1}>
          {meta.etiqueta}
          {distancia !== null ? ` · ${formatearDistancia(distancia)}` : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={COLORES.textoTenue} />
    </TouchableOpacity>
  );
}

function MensajeGps({
  icono,
  titulo,
  texto,
  onReintentar,
}: {
  icono: 'location-outline' | 'cloud-offline-outline' | 'locate-outline' | 'map-outline';
  titulo: string;
  texto: string;
  onReintentar?: () => void;
}) {
  return (
    <View style={styles.centroInterno}>
      <View style={{ alignItems: 'center' }}>
        <Ionicons name={icono} size={56} color={COLORES.primario} />
      </View>
      <Text style={styles.textoGrande}>{titulo}</Text>
      <AvisoBanner tono="info" texto={texto} />
      {onReintentar ? <Boton texto="Probar de nuevo" icono="refresh" onPress={onReintentar} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.fondo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: COLORES.fondo },
  cuerpoGps: { flex: 1, padding: 16 },
  centroInterno: { flex: 1, alignItems: 'stretch', justifyContent: 'center', gap: 14 },
  textoGrande: { fontSize: 21, fontWeight: '800', color: COLORES.texto, textAlign: 'center', marginBottom: 6 },
  pie: { padding: 16 },
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    marginBottom: 4,
    paddingHorizontal: 14,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  input: { flex: 1, fontSize: 17, color: COLORES.texto, paddingVertical: 10 },
  lista: { padding: 16, paddingBottom: 32, flexGrow: 1 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    minHeight: 64,
    borderRadius: 14,
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  icono: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  nombre: { fontSize: 17, fontWeight: '800', color: COLORES.texto },
  detalle: { fontSize: 15, color: COLORES.textoSecundario },
});
