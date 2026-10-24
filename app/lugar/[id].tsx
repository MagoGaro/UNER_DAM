import { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Linking } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Image } from 'expo-image';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { evaluarEstadoHorario } from '@/src/utils/horarios';
import { abrirEnMapaExterno } from '@/src/utils/geo';
import type { Lugar } from '@/src/tipos/lugar';
import { servicioLugares } from '@/src/servicios/lugares';
import { rutaConfirmarVisita } from '@/src/navegacion/rutas';

function formatearTiempo(segundos: number): string {
  if (!segundos || isNaN(segundos)) return '0:00';
  const mins = Math.floor(segundos / 60);
  const segs = Math.floor(segundos % 60);
  return `${mins}:${segs < 10 ? '0' : ''}${segs}`;
}

export default function DetalleLugarPantalla() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [cargando, setCargando] = useState(true);

  // Configurar modo de audio de Expo
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  // Cargar datos del lugar de forma asíncrona
  useEffect(() => {
    async function cargarDetalle() {
      if (!id) return;
      setCargando(true);
      const datos = await servicioLugares.obtenerPorId(id);
      setLugar(datos);
      setCargando(false);
    }
    cargarDetalle();
  }, [id]);

  const fuenteAudio = useMemo(() => {
    if (lugar?.id === 'lug-004') {
      return require('@/assets/audio/molino_forclaz.mp3');
    }
    if (lugar?.audioguia?.url) {
      return { uri: lugar.audioguia.url };
    }
    return null;
  }, [lugar?.id, lugar?.audioguia?.url]);

  const reproductorAudio = useAudioPlayer(fuenteAudio);
  const estadoAudio = useAudioPlayerStatus(reproductorAudio);

  useEffect(() => {
    if (fuenteAudio && reproductorAudio) {
      try {
        reproductorAudio.replace(fuenteAudio);
      } catch (e) {
        console.log('Error actualizando fuente de audioguía:', e);
      }
    }
  }, [fuenteAudio, reproductorAudio]);

  // Evaluar horario dinámico en tiempo real
  const estadoHorario = lugar ? evaluarEstadoHorario(lugar) : null;

  // Resumen de horarios agrupaditos por temporada (Verano / Invierno / General)
  const resumenTemporadas = useMemo(() => {
    if (!lugar?.horarios || lugar.horarios.length === 0) return [];
    
    const mapTemporadas = new Map<string, string>();
    for (const h of lugar.horarios) {
      const tempNombre = h.temporada
        ? h.temporada.charAt(0).toUpperCase() + h.temporada.slice(1).toLowerCase()
        : 'General';
      if (!mapTemporadas.has(tempNombre)) {
        mapTemporadas.set(tempNombre, `${h.abre} a ${h.cierra} hs`);
      }
    }
    return Array.from(mapTemporadas.entries());
  }, [lugar?.horarios]);

  const alternarReproduccion = () => {
    if (!reproductorAudio || !fuenteAudio) return;

    if (estadoAudio.playing) {
      reproductorAudio.pause();
    } else {
      if (estadoAudio.duration > 0 && estadoAudio.currentTime >= estadoAudio.duration) {
        reproductorAudio.seekTo(0);
      }
      reproductorAudio.play();
    }
  };

  if (cargando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color="#E8590C" />
      </View>
    );
  }

  if (!lugar) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.error}>No se encontró el lugar solicitado.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={estilos.contenedor} edges={['bottom']}>
      <Stack.Screen options={{ title: lugar.nombre, headerBackTitle: 'Atrás' }} />
      <ScrollView contentContainerStyle={estilos.scroll}>
        <Image
          source={{ uri: lugar.imagenes[0] || lugar.imagenUrl }}
          style={estilos.imagen}
          contentFit="cover"
          cachePolicy="disk"
        />
        <View style={estilos.cuerpo}>
          <Text style={estilos.titulo}>{lugar.nombre}</Text>

          {/* Dirección y Botón "Cómo llegar" */}
          <View style={estilos.bloqueUbicacion}>
            <Text style={estilos.direccion}>
              <Ionicons name="location-outline" size={16} /> {lugar.direccion}
            </Text>

            <Pressable
              style={estilos.botonComoLlegar}
              onPress={() =>
                abrirEnMapaExterno(
                  lugar.coordenadas.latitud,
                  lugar.coordenadas.longitud,
                  lugar.nombre
                )
              }
            >
              <Ionicons name="navigate-circle-outline" size={20} color="#0B5394" />
              <Text style={estilos.textoComoLlegar}>Cómo llegar (Abrir Mapa)</Text>
            </Pressable>
          </View>

          {/* Registrar visita */}
          <Pressable
            style={estilos.botonRegistrarVisita}
            onPress={() => router.push(rutaConfirmarVisita(lugar.id, 'manual'))}
            accessibilityRole="button"
          >
            <Ionicons name="footsteps-outline" size={22} color="#fff" />
            <Text style={estilos.textoRegistrarVisita}>Registrar visita</Text>
          </Pressable>

          {/* Reproductor de Audioguía Reactivo */}
          {lugar.audioguia && (
            <View style={estilos.tarjetaAudio}>
              <View style={estilos.encabezadoAudio}>
                <Ionicons name="headset" size={20} color="#5C4A00" />
                <Text style={estilos.tituloAudio}>
                  Audioguía en {lugar.audioguia.idioma === 'es' ? 'español' : 'inglés'}
                </Text>
              </View>

              <Pressable style={estilos.botonAudio} onPress={alternarReproduccion}>
                <Ionicons
                  name={estadoAudio.playing ? 'pause' : 'play'}
                  size={22}
                  color="#fff"
                />
                <Text style={estilos.textoBotonAudio}>
                  {estadoAudio.playing ? 'Pausar relato' : 'Escuchar relato'}
                </Text>
              </Pressable>

              {/* Tiempo y estado del relato */}
              <View style={estilos.infoTiempo}>
                <Text style={estilos.textoTiempo}>
                  {formatearTiempo(estadoAudio.currentTime)} /{' '}
                  {formatearTiempo(
                    estadoAudio.duration || lugar.audioguia.duracionSegundos
                  )}
                </Text>
                <Text style={estilos.estadoTexto}>
                  {estadoAudio.playing ? 'Reproduciendo relato...' : 'Pausado'}
                </Text>
              </View>
            </View>
          )}

          <Text style={estilos.descripcion}>{lugar.descripcion}</Text>

          {/* Información útil completa */}
          <View style={estilos.infoBloque}>
            <Text style={estilos.subtitulo}>Información útil</Text>

            {/* Accesibilidad para silla de ruedas */}
            <View style={estilos.filaAccesibilidad}>
              <MaterialIcons
                name="accessible"
                size={18}
                color={lugar.accesible ? '#2E9E4C' : '#E03131'}
              />
              <Text
                style={[
                  estilos.textoInfo,
                  { color: lugar.accesible ? '#2E9E4C' : '#E03131', fontWeight: '600' },
                ]}
              >
                {lugar.accesible
                  ? 'Accesible para sillas de ruedas'
                  : 'No accesible para sillas de ruedas'}
              </Text>
            </View>

            {/* Precio Entrada */}
            {lugar.precioEntrada !== null && (
              <Text style={estilos.textoInfo}>
                <Ionicons name="ticket-outline" size={16} /> Entrada:{' '}
                {lugar.precioEntrada === 0 ? 'Gratis' : `$${lugar.precioEntrada}`}
              </Text>
            )}

            {/* Teléfono */}
            {lugar.telefono && (
              <Pressable onPress={() => Linking.openURL(`tel:${lugar.telefono}`)}>
                <Text style={[estilos.textoInfo, estilos.enlace]}>
                  <Ionicons name="call-outline" size={16} /> {lugar.telefono}
                </Text>
              </Pressable>
            )}

            {/* Sitio Web */}
            {lugar.sitioWeb && (
              <Pressable onPress={() => Linking.openURL(lugar.sitioWeb!)}>
                <Text style={[estilos.textoInfo, estilos.enlace]}>
                  <Ionicons name="globe-outline" size={16} />{' '}
                  {lugar.sitioWeb.replace(/^https?:\/\//, '')}
                </Text>
              </Pressable>
            )}

            {/* Badge dinámico Abierto / Cerrado hoy */}
            {estadoHorario && (
              <View style={estilos.filaHorarioDinamico}>
                <Ionicons name="time-outline" size={18} color="#495057" />
                <View
                  style={[
                    estilos.badgeEstadoHorario,
                    { backgroundColor: estadoHorario.color },
                  ]}
                >
                  <Text style={estilos.textoBadgeEstadoHorario}>
                    {estadoHorario.etiqueta}
                  </Text>
                </View>
                <Text style={estilos.textoHorarioDinamico}>
                  {estadoHorario.mensaje}
                </Text>
              </View>
            )}

            {/* Horarios por temporada */}
            {resumenTemporadas.length > 0 && (
              <View style={estilos.bloqueTemporadas}>
                <Text style={estilos.subtituloTemporadas}>Horarios de atención:</Text>
                {resumenTemporadas.map(([temporada, rango]) => (
                  <Text key={temporada} style={estilos.textoTemporada}>
                    • {temporada}: {rango}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#fff' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  scroll: { paddingBottom: 24 },
  imagen: { width: '100%', height: 250 },
  cuerpo: { padding: 16, gap: 16 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#1A2530' },

  bloqueUbicacion: { gap: 10 },
  direccion: { fontSize: 15, color: '#0B5394', fontWeight: '500' },
  botonComoLlegar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E7F5FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A5D8FF',
    alignSelf: 'flex-start',
  },
  textoComoLlegar: { color: '#0B5394', fontWeight: 'bold', fontSize: 14 },
  botonRegistrarVisita: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#C2410C',
  },
  textoRegistrarVisita: { color: '#fff', fontWeight: '800', fontSize: 17 },

  descripcion: { fontSize: 16, lineHeight: 24, color: '#4A5568' },
  error: { fontSize: 16, color: 'red' },

  tarjetaAudio: {
    backgroundColor: '#FFF3BF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  encabezadoAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tituloAudio: { fontSize: 16, fontWeight: 'bold', color: '#5C4A00' },
  botonAudio: {
    flexDirection: 'row',
    backgroundColor: '#E8590C',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  textoBotonAudio: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  infoTiempo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  textoTiempo: { fontSize: 13, fontWeight: '600', color: '#5C4A00' },
  estadoTexto: { fontSize: 13, fontStyle: 'italic', color: '#854D0E' },

  infoBloque: { marginTop: 8, gap: 12, backgroundColor: '#F8F9FA', padding: 16, borderRadius: 12 },
  subtitulo: { fontSize: 18, fontWeight: 'bold', color: '#1A2530', marginBottom: 4 },
  textoInfo: { fontSize: 15, color: '#4A5568' },
  enlace: { color: '#0B5394', textDecorationLine: 'underline' },

  filaAccesibilidad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  filaHorarioDinamico: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  badgeEstadoHorario: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  textoBadgeEstadoHorario: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textoHorarioDinamico: {
    fontSize: 14,
    color: '#343A40',
    flex: 1,
  },

  bloqueTemporadas: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 4,
  },
  subtituloTemporadas: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2530',
  },
  textoTemporada: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 4,
  },
});