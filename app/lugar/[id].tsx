import { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Linking } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Image } from 'expo-image';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { evaluarEstadoHorario, resumenSemanal } from '@/src/utils/horarios';
import { abrirEnMapaExterno } from '@/src/utils/geo';
import type { Lugar } from '@/src/tipos/lugar';
import { servicioLugares } from '@/src/servicios/lugares';
import { rutaConfirmarVisita } from '@/src/navegacion/rutas';
import { useAudioguiaOffline } from '@/src/audio/useAudioguiaOffline';
import { BotonFavorito } from '@/src/componentes/favoritos/BotonFavorito';

function nombreIdioma(idioma: string): string {
  if (idioma === 'en') return 'inglés';
  if (idioma === 'pt') return 'portugués';
  return 'español';
}

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
    // shouldPlayInBackground: la audioguía sigue con el celular en el bolsillo y la pantalla apagada.
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' }).catch(() => {});
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

  const audioOffline = useAudioguiaOffline(lugar);
  const fuenteAudio = audioOffline.fuente;

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

  // Horarios de la semana (por temporada, con los días seguidos juntos)
  const horariosSemana = useMemo(() => resumenSemanal(lugar?.horarios ?? []), [lugar?.horarios]);

  const alternarReproduccion = () => {
    if (!reproductorAudio || !fuenteAudio) return;

    if (estadoAudio.playing) {
      reproductorAudio.pause();
    } else {
      if (estadoAudio.duration > 0 && estadoAudio.currentTime >= estadoAudio.duration) {
        reproductorAudio.seekTo(0);
      }
      reproductorAudio.play();
      try {
        reproductorAudio.setActiveForLockScreen(
          true,
          { title: lugar?.nombre ?? 'Audioguía', artist: 'Mi Ciudad Colón', albumTitle: 'Audioguías de Colón' },
          { showSeekBackward: true, showSeekForward: true }
        );
      } catch {
        // Sin controles en la pantalla de bloqueo: igual se escucha.
      }
    }
  };

  const duracionTotal = estadoAudio.duration || lugar?.audioguia?.duracionSegundos || 0;
  const avance = duracionTotal > 0 ? Math.min(estadoAudio.currentTime / duracionTotal, 1) : 0;

  const saltar = (segundos: number) => {
    if (!reproductorAudio || !fuenteAudio) return;
    const destino = Math.min(Math.max(estadoAudio.currentTime + segundos, 0), duracionTotal || Number.MAX_SAFE_INTEGER);
    try {
      reproductorAudio.seekTo(destino);
    } catch {
      // El reproductor todavía no cargó: no pasa nada.
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
      <Stack.Screen
        options={{
          title: lugar.nombre,
          headerBackTitle: 'Atrás',
          headerRight: () => <BotonFavorito lugarId={lugar.id} nombre={lugar.nombre} />,
        }}
      />
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

          {/* Reproductor de audioguía: pausa, adelantar/retroceder, cuánto falta y uso sin señal */}
          {lugar.audioguia && (
            <View style={estilos.tarjetaAudio}>
              <View style={estilos.encabezadoAudio}>
                <Ionicons name="headset" size={20} color="#5C4A00" />
                <Text style={estilos.tituloAudio}>Audioguía en {nombreIdioma(lugar.audioguia.idioma)}</Text>
              </View>

              <Pressable
                style={estilos.botonAudio}
                onPress={alternarReproduccion}
                accessibilityRole="button"
                accessibilityLabel={estadoAudio.playing ? 'Pausar audioguía' : 'Escuchar audioguía'}
              >
                <Ionicons name={estadoAudio.playing ? 'pause' : 'play'} size={22} color="#fff" />
                <Text style={estilos.textoBotonAudio}>
                  {estadoAudio.playing ? 'Pausar relato' : 'Escuchar relato'}
                </Text>
              </Pressable>

              <View style={estilosAudio.fila}>
                <Pressable
                  style={estilosAudio.salto}
                  onPress={() => saltar(-15)}
                  accessibilityRole="button"
                  accessibilityLabel="Retroceder 15 segundos"
                >
                  <Ionicons name="play-back" size={20} color="#5C4A00" />
                  <Text style={estilosAudio.textoSalto}>15 s</Text>
                </Pressable>
                <View
                  style={estilosAudio.barra}
                  accessibilityRole="progressbar"
                  accessibilityValue={{ min: 0, max: 100, now: Math.round(avance * 100) }}
                >
                  <View style={[estilosAudio.barraAvance, { width: `${Math.round(avance * 100)}%` }]} />
                </View>
                <Pressable
                  style={estilosAudio.salto}
                  onPress={() => saltar(15)}
                  accessibilityRole="button"
                  accessibilityLabel="Adelantar 15 segundos"
                >
                  <Text style={estilosAudio.textoSalto}>15 s</Text>
                  <Ionicons name="play-forward" size={20} color="#5C4A00" />
                </Pressable>
              </View>

              <View style={estilos.infoTiempo}>
                <Text style={estilos.textoTiempo}>
                  {formatearTiempo(estadoAudio.currentTime)} / {formatearTiempo(duracionTotal)}
                </Text>
                <Text style={estilos.estadoTexto}>
                  Faltan {formatearTiempo(Math.max(duracionTotal - estadoAudio.currentTime, 0))}
                </Text>
              </View>

              {audioOffline.estado === 'incluida' && (
                <Text style={estilosAudio.nota}>✓ Incluida en la app: funciona sin señal.</Text>
              )}
              {audioOffline.estado === 'descargada' && (
                <View style={estilosAudio.filaOffline}>
                  <Text style={estilosAudio.nota}>✓ Guardada en tu teléfono: funciona sin señal.</Text>
                  <Pressable onPress={audioOffline.quitar} accessibilityRole="button" style={estilosAudio.botonChico}>
                    <Text style={estilosAudio.textoBotonChico}>Quitar</Text>
                  </Pressable>
                </View>
              )}
              {(audioOffline.estado === 'no-descargada' || audioOffline.estado === 'descargando') && (
                <Pressable
                  onPress={audioOffline.descargar}
                  disabled={audioOffline.estado === 'descargando'}
                  accessibilityRole="button"
                  style={[estilosAudio.botonDescarga, audioOffline.estado === 'descargando' && { opacity: 0.6 }]}
                >
                  <Ionicons name="download-outline" size={20} color="#5C4A00" />
                  <Text style={estilosAudio.textoBotonChico}>
                    {audioOffline.estado === 'descargando' ? 'Descargando…' : 'Guardar para usar sin señal'}
                  </Text>
                </Pressable>
              )}
              {audioOffline.error && <Text style={estilosAudio.error}>{audioOffline.error}</Text>}
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

            {/* Horarios de la semana */}
            {horariosSemana.length > 0 && (
              <View style={estilos.bloqueTemporadas}>
                <Text style={estilos.subtituloTemporadas}>Horarios de atención:</Text>
                {horariosSemana.map((grupo) => (
                  <View key={grupo.titulo}>
                    {(horariosSemana.length > 1 || grupo.titulo !== 'General') && (
                      <Text style={estilos.textoTemporada}>{grupo.titulo}</Text>
                    )}
                    {grupo.lineas.map((linea) => (
                      <Text key={`${grupo.titulo}-${linea.dias}`} style={estilos.textoTemporada}>
                        • {linea.dias}: {linea.texto}
                      </Text>
                    ))}
                  </View>
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
const estilosAudio = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  salto: { minHeight: 48, minWidth: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  textoSalto: { fontSize: 14, fontWeight: '800', color: '#5C4A00' },
  barra: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#E9DFA8', overflow: 'hidden' },
  barraAvance: { height: 8, backgroundColor: '#C2410C' },
  nota: { flex: 1, marginTop: 10, fontSize: 14, fontWeight: '700', color: '#1B5E20' },
  filaOffline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  botonChico: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' },
  botonDescarga: {
    minHeight: 48,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#5C4A00',
  },
  textoBotonChico: { fontSize: 15, fontWeight: '800', color: '#5C4A00' },
  error: { marginTop: 8, fontSize: 14, fontWeight: '700', color: '#B3261E' },
});
