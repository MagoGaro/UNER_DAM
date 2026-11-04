import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { agenda, DIAS_AGENDA } from '@/src/agenda/almacenAgenda';
import { contarPorDia, eventosDelDia } from '@/src/agenda/logicaAgenda';
import { SelectorDias } from '@/src/componentes/agenda/SelectorDias';
import { TarjetaEvento } from '@/src/componentes/agenda/TarjetaEvento';
import { AvisoBanner } from '@/src/componentes/estados/AvisoBanner';
import { Boton } from '@/src/componentes/estados/Boton';
import { EstadoVacio } from '@/src/componentes/estados/EstadoVacio';
import { COLORES } from '@/src/configuracion/tema';
import { MENSAJE_PROBLEMA_SERVIDOR, TITULO_PROBLEMA_SERVIDOR } from '@/src/servicios/api/mensajes';
import { useAhora } from '@/src/hooks/useAhora';
import { useCatalogoLugares } from '@/src/hooks/useCatalogoLugares';
import { rutaDetalleEvento } from '@/src/navegacion/rutas';
import type { Evento } from '@/src/tipos/evento';
import { useAlmacen } from '@/src/utils/almacen';
import { capitalizar, claveDia, desdeISO, etiquetaDiaCorta, formatearDiaLargo, formatearHora, proximosDias } from '@/src/utils/fechas';

type Vista = 'dia' | 'guardados';

export function AgendaPantalla() {
  const ahora = useAhora();
  const estado = useAlmacen(agenda.almacen);
  const { porId } = useCatalogoLugares();
  const [vista, setVista] = useState<Vista>('dia');
  const [diaSeleccionado, setDiaSeleccionado] = useState(() => claveDia(new Date()));

  // Cada vez que se entra a la pestaña se actualiza (y se detectan suspensiones).
  useFocusEffect(
    useCallback(() => {
      agenda.cargarEventos();
    }, [])
  );

  const dias = useMemo(() => proximosDias(ahora, DIAS_AGENDA), [ahora]);
  const cantidadPorDia = useMemo(() => contarPorDia(estado.eventos, ahora), [estado.eventos, ahora]);
  const diaActual = dias.find((d) => claveDia(d) === diaSeleccionado) ?? dias[0];
  const eventosDia = useMemo(() => eventosDelDia(estado.eventos, diaActual), [estado.eventos, diaActual]);

  const guardados = useMemo(() => {
    return estado.eventos
      .filter((e) => estado.guardados[e.id])
      .filter((e) => (desdeISO(e.fin ?? e.inicio)?.getTime() ?? 0) >= ahora.getTime() - 6 * 3_600_000)
      .sort((a, b) => a.inicio.localeCompare(b.inicio));
  }, [estado.eventos, estado.guardados, ahora]);

  const proximoDiaConEventos = useMemo(
    () => dias.find((d) => claveDia(d) > diaSeleccionado && (cantidadPorDia[claveDia(d)] ?? 0) > 0),
    [dias, diaSeleccionado, cantidadPorDia]
  );

  const nombreLugar = (ev: Evento) => (ev.lugarId ? (porId[ev.lugarId]?.nombre ?? null) : null);
  const abrir = (ev: Evento) => router.push(rutaDetalleEvento(ev.id));

  const cargandoPrimeraVez = estado.eventos.length === 0 && (estado.estado === 'cargando' || estado.estado === 'inicial');
  const datos = vista === 'dia' ? eventosDia : guardados;

  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo} accessibilityRole="header">Agenda</Text>
        <View style={styles.segmento} accessibilityRole="tablist">
          {(['dia', 'guardados'] as const).map((v) => (
            <TouchableOpacity
              key={v}
              onPress={() => setVista(v)}
              accessibilityRole="tab"
              accessibilityState={{ selected: vista === v }}
              style={[styles.opcion, vista === v && styles.opcionActiva]}>
              <Text style={[styles.opcionTexto, vista === v && styles.opcionTextoActiva]}>
                {v === 'dia' ? 'Por día' : `Guardados${Object.keys(estado.guardados).length ? ` (${guardados.length})` : ''}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {vista === 'dia' ? (
        <SelectorDias
          dias={dias}
          hoy={ahora}
          seleccionado={claveDia(diaActual)}
          cantidadPorDia={cantidadPorDia}
          onSeleccionar={setDiaSeleccionado}
        />
      ) : null}

      {estado.desdeCache ? (
        <View style={styles.banner}>
          <AvisoBanner
            texto={`Sin conexión. Te mostramos la agenda guardada${
              estado.actualizadoEn ? ` el ${formatearHora(desdeISO(estado.actualizadoEn)!)} hs` : ''
            }.`}
          />
        </View>
      ) : null}

      {cargandoPrimeraVez ? (
        <ActivityIndicator size="large" color={COLORES.primario} style={styles.cargando} />
      ) : estado.estado === 'error' && estado.eventos.length === 0 ? (
        <EstadoVacio
          icono="cloud-offline-outline"
          titulo={TITULO_PROBLEMA_SERVIDOR}
          descripcion={MENSAJE_PROBLEMA_SERVIDOR}
          textoBoton="Reintentar"
          onPresionarBoton={() => agenda.cargarEventos()}
        />
      ) : (
        <FlatList
          data={datos}
          keyExtractor={(ev) => ev.id}
          contentContainerStyle={styles.lista}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={
            <RefreshControl
              refreshing={estado.estado === 'cargando' && estado.eventos.length > 0}
              onRefresh={() => agenda.cargarEventos()}
              colors={[COLORES.primario]}
            />
          }
          ListHeaderComponent={
            vista === 'dia' ? (
              <Text style={styles.subtitulo}>
                {etiquetaDiaCorta(diaActual, ahora).titulo === 'Hoy'
                  ? `Hoy, ${formatearDiaLargo(diaActual)}`
                  : capitalizar(formatearDiaLargo(diaActual))}
              </Text>
            ) : null
          }
          renderItem={({ item }) => {
            const inicio = desdeISO(item.inicio);
            return (
              <TarjetaEvento
                evento={item}
                nombreLugar={nombreLugar(item)}
                guardado={Boolean(estado.guardados[item.id])}
                ahora={ahora}
                conFecha={vista === 'guardados' && inicio ? (() => { const e = etiquetaDiaCorta(inicio, ahora); return e.titulo === 'Hoy' || e.titulo === 'Mañana' ? e.titulo : e.subtitulo; })() : undefined}
                onPress={() => abrir(item)}
              />
            );
          }}
          ListEmptyComponent={
            vista === 'dia' ? (
              <View style={styles.vacio}>
                <EstadoVacio icono="calendar-outline" titulo="No hay eventos este día" />
                {proximoDiaConEventos ? (
                  <Boton
                    variante="secundario"
                    icono="arrow-forward"
                    texto={`Ver ${(() => { const e = etiquetaDiaCorta(proximoDiaConEventos, ahora); return e.titulo === 'Mañana' ? 'mañana' : `el ${formatearDiaLargo(proximoDiaConEventos)}`; })()}`}
                    onPress={() => setDiaSeleccionado(claveDia(proximoDiaConEventos))}
                  />
                ) : null}
              </View>
            ) : (
              <EstadoVacio
                icono="bookmark-outline"
                titulo="Todavía no guardaste eventos"
                descripcion="Entrá a un evento y tocá «Guardar y avisarme»: te mandamos un aviso antes de que empiece."
              />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.fondo },
  encabezado: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },
  titulo: { fontSize: 30, fontWeight: '800', color: COLORES.texto },
  segmento: { flexDirection: 'row', backgroundColor: '#E3E7EB', borderRadius: 12, padding: 4 },
  opcion: { flex: 1, minHeight: 44, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  opcionActiva: { backgroundColor: COLORES.superficie },
  opcionTexto: { fontSize: 16, fontWeight: '700', color: COLORES.textoSecundario },
  opcionTextoActiva: { color: COLORES.texto },
  banner: { paddingHorizontal: 16, paddingBottom: 4 },
  subtitulo: { fontSize: 16, fontWeight: '700', color: COLORES.textoSecundario, marginBottom: 10 },
  lista: { padding: 16, paddingBottom: 32, flexGrow: 1 },
  cargando: { marginTop: 40 },
  vacio: { gap: 8, paddingHorizontal: 16 },
});
