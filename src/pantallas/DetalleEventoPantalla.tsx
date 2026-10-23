import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { agenda } from '@/src/agenda/almacenAgenda';
import { estadoVisible, momentoRecordatorio } from '@/src/agenda/logicaAgenda';
import { EtiquetaEstadoEvento } from '@/src/componentes/agenda/EtiquetaEstadoEvento';
import { AvisoBanner } from '@/src/componentes/estados/AvisoBanner';
import { Boton } from '@/src/componentes/estados/Boton';
import { EstadoVacio } from '@/src/componentes/estados/EstadoVacio';
import { COLORES } from '@/src/configuracion/tema';
import { useAhora } from '@/src/hooks/useAhora';
import { useCatalogoLugares } from '@/src/hooks/useCatalogoLugares';
import { abrirComoLlegar } from '@/src/navegacion/abrirComoLlegar';
import { abrirDireccionEnMapa } from '@/src/navegacion/abrirDireccion';
import { rutaDetalleLugar } from '@/src/navegacion/rutas';
import { servicioEventos } from '@/src/servicios/eventos';
import { esError } from '@/src/tipos/api';
import type { Evento } from '@/src/tipos/evento';
import { useAlmacen } from '@/src/utils/almacen';
import { capitalizar, desdeISO, formatearDiaLargo, formatearDuracion, formatearHora, formatearPrecio } from '@/src/utils/fechas';

type Carga = { estado: 'cargando' } | { estado: 'listo'; evento: Evento } | { estado: 'no-existe' } | { estado: 'error' };

export function DetalleEventoPantalla({ id }: { id: string | undefined }) {
  const ahora = useAhora();
  const agendaEstado = useAlmacen(agenda.almacen);
  const { porId } = useCatalogoLugares();
  const [carga, setCarga] = useState<Carga>({ estado: 'cargando' });
  const [intento, setIntento] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState<string | null>(null);

  // Primero lo que ya está en el teléfono (sirve sin señal); si no está, se pide al servicio.
  const enAgenda = id ? agendaEstado.eventos.find((e) => e.id === id) : undefined;

  useEffect(() => {
    if (!id) {
      setCarga({ estado: 'no-existe' });
      return;
    }
    if (enAgenda) {
      setCarga({ estado: 'listo', evento: enAgenda });
      return;
    }
    let cancelado = false;
    setCarga({ estado: 'cargando' });
    servicioEventos
      .obtenerEvento(id)
      .then((r) => {
        if (cancelado) return;
        setCarga(esError(r) ? { estado: 'no-existe' } : { estado: 'listo', evento: r.datos });
      })
      .catch(() => !cancelado && setCarga({ estado: 'error' }));
    return () => {
      cancelado = true;
    };
  }, [id, enAgenda, intento]);

  if (carga.estado === 'cargando') {
    return (
      <View style={styles.centro}>
        <Stack.Screen options={{ title: 'Evento' }} />
        <ActivityIndicator size="large" color={COLORES.primario} />
      </View>
    );
  }
  if (carga.estado !== 'listo') {
    return (
      <View style={styles.centro}>
        <Stack.Screen options={{ title: 'Evento' }} />
        <EstadoVacio
          icono={carga.estado === 'error' ? 'cloud-offline-outline' : 'calendar-outline'}
          titulo={carga.estado === 'error' ? 'No pudimos cargar el evento' : 'Este evento ya no está en la agenda'}
          textoBoton={carga.estado === 'error' ? 'Reintentar' : 'Volver a la agenda'}
          onPresionarBoton={() => (carga.estado === 'error' ? setIntento((n) => n + 1) : router.back())}
        />
      </View>
    );
  }

  const evento = carga.evento;
  const estado = estadoVisible(evento, ahora);
  const inicio = desdeISO(evento.inicio);
  const fin = desdeISO(evento.fin);
  const duracion = formatearDuracion(evento.inicio, evento.fin);
  const precio = formatearPrecio(evento.precio);
  const lugar = evento.lugarId ? (porId[evento.lugarId] ?? null) : null;
  const coordenadas = lugar?.coordenadas ?? evento.coordenadas;
  const textoDonde = lugar?.nombre ?? evento.direccionLibre ?? (evento.lugarId ? 'Lugar no disponible' : 'Lugar a confirmar');
  const guardado = Boolean(agendaEstado.guardados[evento.id]);
  const puedeAvisar = estado === 'programado' && momentoRecordatorio(evento.inicio, ahora) !== null;

  async function alternarGuardado() {
    setGuardando(true);
    try {
      const r = await agenda.alternarGuardado(evento);
      if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
      if (!r.guardado) setMensajeGuardado('Lo quitamos de tus guardados.');
      else if (r.recordatorio) setMensajeGuardado(`Listo. Te avisamos a las ${formatearHora(r.recordatorio)} hs.`);
      else if (estado !== 'programado') setMensajeGuardado('Guardado. Si vuelve a programarse, te avisamos.');
      else if (Platform.OS === 'web') setMensajeGuardado('Guardado. Los avisos funcionan en la app del celular.');
      else setMensajeGuardado('Guardado. No pudimos programar el aviso: revisá el permiso de notificaciones.');
    } finally {
      setGuardando(false);
    }
  }

  async function comoLlegar() {
    if (coordenadas) {
      const ok = await abrirComoLlegar(coordenadas, 'caminando');
      if (ok) return;
    }
    if (evento.direccionLibre) await abrirDireccionEnMapa(evento.direccionLibre);
  }

  return (
    <SafeAreaView style={styles.contenedor} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Evento', headerBackTitle: 'Agenda' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {evento.imagenUrl ? (
          <Image source={{ uri: evento.imagenUrl }} style={styles.imagen} contentFit="cover" cachePolicy="disk" accessibilityIgnoresInvertColors />
        ) : (
          <View style={[styles.imagen, styles.sinImagen]}>
            <Ionicons name="calendar" size={56} color={COLORES.primario} />
          </View>
        )}

        <View style={styles.cuerpo}>
          {estado === 'suspendido' ? (
            <AvisoBanner tono="peligro" texto="Este evento está suspendido. Si lo guardaste, te avisamos cuando haya novedades." />
          ) : estado === 'cancelado' ? (
            <AvisoBanner tono="peligro" texto="Este evento se canceló." />
          ) : estado === 'finalizado' ? (
            <AvisoBanner tono="info" texto="Este evento ya terminó." />
          ) : null}

          <EtiquetaEstadoEvento estado={estado} />
          <Text style={styles.titulo} accessibilityRole="header">{evento.titulo}</Text>

          <View style={styles.datos}>
            <FilaDato icono="calendar-outline" titulo="Cuándo" valor={inicio ? capitalizar(formatearDiaLargo(inicio)) : 'Fecha a confirmar'} />
            <FilaDato
              icono="time-outline"
              titulo="Empieza"
              valor={inicio ? `${formatearHora(inicio)} hs${fin ? ` · termina ${formatearHora(fin)} hs` : ''}` : '—'}
            />
            <FilaDato icono="hourglass-outline" titulo="Dura" valor={duracion ?? 'Sin hora de fin informada'} />
            <FilaDato
              icono="location-outline"
              titulo="Dónde"
              valor={textoDonde}
              detalle={lugar && evento.direccionLibre ? evento.direccionLibre : (lugar?.direccion ?? null)}
              onPress={lugar ? () => router.push(rutaDetalleLugar(lugar.id)) : undefined}
            />
            <FilaDato
              icono="ticket-outline"
              titulo="Entrada"
              valor={precio ?? 'Precio no informado'}
              destacado={evento.precio === 0}
            />
          </View>

          <View style={styles.acciones}>
            <Boton
              texto={guardado ? 'Guardado · tocar para quitar' : puedeAvisar ? 'Guardar y avisarme' : 'Guardar'}
              icono={guardado ? 'bookmark' : 'bookmark-outline'}
              variante={guardado ? 'secundario' : 'primario'}
              cargando={guardando}
              onPress={alternarGuardado}
              accessibilityHint={puedeAvisar ? 'Te mandamos una notificación una hora antes' : undefined}
            />
            {mensajeGuardado ? <Text style={styles.mensaje} accessibilityLiveRegion="polite">{mensajeGuardado}</Text> : null}
            {coordenadas || evento.direccionLibre ? (
              <Boton texto="Cómo llegar" icono="navigate-outline" variante="secundario" onPress={comoLlegar} />
            ) : null}
          </View>

          <Text style={styles.seccion}>Qué es</Text>
          <Text style={styles.descripcion}>{evento.descripcion}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FilaDato({
  icono,
  titulo,
  valor,
  detalle,
  destacado,
  onPress,
}: {
  icono: ComponentProps<typeof Ionicons>['name'];
  titulo: string;
  valor: string;
  detalle?: string | null;
  destacado?: boolean;
  onPress?: () => void;
}) {
  const contenido = (
    <View style={styles.fila}>
      <Ionicons name={icono} size={24} color={COLORES.textoSecundario} />
      <View style={{ flex: 1 }}>
        <Text style={styles.filaTitulo}>{titulo}</Text>
        <Text style={[styles.filaValor, destacado && { color: COLORES.exito }, onPress && styles.enlace]}>{valor}</Text>
        {detalle ? <Text style={styles.filaDetalle}>{detalle}</Text> : null}
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={22} color={COLORES.textoTenue} /> : null}
    </View>
  );
  return onPress ? (
    <TouchableOpacity onPress={onPress} accessibilityRole="link" accessibilityLabel={`${titulo}: ${valor}. Ver el lugar`}>
      {contenido}
    </TouchableOpacity>
  ) : (
    contenido
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.superficie },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: COLORES.superficie },
  scroll: { paddingBottom: 32 },
  imagen: { width: '100%', aspectRatio: 16 / 9, backgroundColor: COLORES.fondo },
  sinImagen: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORES.primarioClaro },
  cuerpo: { padding: 16, gap: 14 },
  titulo: { fontSize: 26, fontWeight: '800', color: COLORES.texto },
  datos: { gap: 14, backgroundColor: COLORES.fondo, borderRadius: 14, padding: 14 },
  fila: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  filaTitulo: { fontSize: 13, fontWeight: '700', color: COLORES.textoTenue, textTransform: 'uppercase' },
  filaValor: { fontSize: 17, fontWeight: '700', color: COLORES.texto, textTransform: 'none' },
  filaDetalle: { fontSize: 15, color: COLORES.textoSecundario },
  enlace: { color: COLORES.enlace, textDecorationLine: 'underline' },
  acciones: { gap: 10 },
  mensaje: { fontSize: 15, fontWeight: '600', color: COLORES.exito, textAlign: 'center' },
  seccion: { fontSize: 19, fontWeight: '800', color: COLORES.texto, marginTop: 4 },
  descripcion: { fontSize: 17, lineHeight: 26, color: COLORES.textoSecundario },
});
