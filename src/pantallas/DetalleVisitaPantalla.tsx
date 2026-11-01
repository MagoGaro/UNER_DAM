import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
import { useConexion } from '@/src/hooks/useConexion';
import { rutaDetalleLugar } from '@/src/navegacion/rutas';
import { LARGO_MAXIMO_NOTA, recorrido } from '@/src/recorrido';
import { useAlmacen } from '@/src/utils/almacen';
import { capitalizar, desdeISO, formatearDiaLargo, formatearHora } from '@/src/utils/fechas';

function confirmar(titulo: string, mensaje: string, textoAccion: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(typeof window !== 'undefined' ? window.confirm(`${titulo}\n\n${mensaje}`) : false);
  }
  return new Promise((resolver) =>
    Alert.alert(titulo, mensaje, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolver(false) },
      { text: textoAccion, style: 'destructive', onPress: () => resolver(true) },
    ])
  );
}

export function DetalleVisitaPantalla({ id, nueva }: { id?: string; nueva?: boolean }) {
  const estado = useAlmacen(recorrido.almacen);
  const conexion = useConexion();
  const { porId } = useCatalogoLugares();
  const visita = estado.visitas.find((v) => v.id === id);
  const [editandoNota, setEditandoNota] = useState(false);
  const [nota, setNota] = useState(visita?.nota ?? '');
  const [cambiandoFoto, setCambiandoFoto] = useState(false);

  useEffect(() => {
    if (!estado.cargado) recorrido.recargar();
  }, [estado.cargado]);

  if (!visita) {
    return (
      <View style={styles.centro}>
        <Stack.Screen options={{ title: 'Visita' }} />
        <EstadoVacio
          icono="footsteps-outline"
          titulo={estado.cargado ? 'Esta visita ya no está en tu recorrido' : 'Cargando…'}
          textoBoton={estado.cargado ? 'Ir a Mi recorrido' : undefined}
          onPresionarBoton={() => router.navigate('/mi-recorrido')}
        />
      </View>
    );
  }

  const lugar = porId[visita.lugarId];
  const fecha = desdeISO(visita.fechaHora);

  async function guardarNota() {
    if (!visita) return;
    await recorrido.editar(visita.id, { nota });
    setEditandoNota(false);
  }

  async function cambiarFoto(uri: string | null) {
    if (!visita) return;
    await recorrido.editar(visita.id, { fotoUri: uri });
    setCambiandoFoto(false);
  }

  async function eliminar() {
    if (!visita) return;
    const ok = await confirmar('¿Borrar esta visita?', 'Se borra del recorrido junto con su foto.', 'Borrar');
    if (!ok) return;
    await recorrido.eliminar(visita.id);
    if (router.canGoBack()) router.back();
    else router.navigate('/mi-recorrido');
  }

  return (
    <SafeAreaView style={styles.contenedor} edges={['bottom']}>
      <Stack.Screen options={{ title: nueva ? '¡Visita registrada!' : 'Visita' }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {nueva ? <AvisoBanner tono="exito" texto="¡Listo! Quedó guardada en tu recorrido." /> : null}

          {visita.fotoUri && !cambiandoFoto ? (
            <View>
              <Image source={{ uri: visita.fotoUri }} style={styles.foto} contentFit="cover" accessibilityLabel="Foto de la visita" />
              <TouchableOpacity style={styles.cambiarFoto} onPress={() => setCambiandoFoto(true)} accessibilityRole="button">
                <Ionicons name="camera-outline" size={20} color="#fff" />
                <Text style={styles.cambiarFotoTexto}>Cambiar foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              <Text style={styles.seccion}>{visita.fotoUri ? 'Cambiar la foto' : 'Sumar una foto'}</Text>
              <SelectorFoto uri={null} onCambiar={(u) => u && cambiarFoto(u)} />
              {cambiandoFoto ? (
                <View style={styles.filaBotones}>
                  <Boton texto="Dejar la actual" variante="secundario" onPress={() => setCambiandoFoto(false)} style={{ flex: 1 }} />
                  <Boton texto="Quitar foto" variante="peligro" onPress={() => cambiarFoto(null)} style={{ flex: 1 }} />
                </View>
              ) : null}
            </View>
          )}

          <TouchableOpacity
            disabled={!lugar}
            onPress={() => lugar && router.push(rutaDetalleLugar(lugar.id))}
            accessibilityRole="link">
            <Text style={[styles.nombre, lugar && styles.enlace]}>{lugar?.nombre ?? 'Lugar que ya no está en la guía'}</Text>
          </TouchableOpacity>
          <Text style={styles.fecha}>
            {fecha ? `${capitalizar(formatearDiaLargo(fecha))} · ${formatearHora(fecha)} hs` : 'Fecha desconocida'}
          </Text>
          <EtiquetaOrigen origen={visita.origen} />

          {visita.sincronizada ? (
            <AvisoBanner tono="exito" icono="cloud-done-outline" texto="Guardada en tu cuenta." />
          ) : (
            <AvisoBanner
              tono="aviso"
              icono="cloud-upload-outline"
              texto={
                conexion === false
                  ? 'Guardada en el teléfono. Se sube sola cuando vuelva la señal.'
                  : 'Guardada en el teléfono, subiéndose…'
              }
            />
          )}

          <Text style={styles.seccion}>Nota</Text>
          {editandoNota ? (
            <View style={{ gap: 8 }}>
              <TextInput
                value={nota}
                onChangeText={setNota}
                style={styles.inputNota}
                multiline
                maxLength={LARGO_MAXIMO_NOTA}
                autoFocus
                accessibilityLabel="Nota de la visita"
                textAlignVertical="top"
              />
              <Text style={styles.contador}>
                {nota.length}/{LARGO_MAXIMO_NOTA}
              </Text>
              <View style={styles.filaBotones}>
                <Boton
                  texto="Cancelar"
                  variante="secundario"
                  onPress={() => {
                    setNota(visita.nota ?? '');
                    setEditandoNota(false);
                  }}
                  style={{ flex: 1 }}
                />
                <Boton texto="Guardar" onPress={guardarNota} style={{ flex: 1 }} />
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditandoNota(true)} accessibilityRole="button" accessibilityLabel="Editar la nota">
              <View style={styles.notaCaja}>
                <Text style={visita.nota ? styles.notaTexto : styles.notaVacia}>
                  {visita.nota ?? 'Tocá para escribir una nota corta.'}
                </Text>
                <Ionicons name="create-outline" size={22} color={COLORES.textoSecundario} />
              </View>
            </TouchableOpacity>
          )}

          <View style={{ marginTop: 16 }}>
            <Boton texto="Borrar visita" variante="peligro" icono="trash-outline" onPress={eliminar} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.superficie },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: COLORES.superficie },
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  foto: { width: '100%', aspectRatio: 4 / 3, borderRadius: 14, backgroundColor: COLORES.fondo },
  cambiarFoto: {
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
  cambiarFotoTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  nombre: { fontSize: 26, fontWeight: '800', color: COLORES.texto },
  enlace: { color: COLORES.enlace },
  fecha: { fontSize: 17, color: COLORES.textoSecundario, fontWeight: '600' },
  seccion: { fontSize: 18, fontWeight: '800', color: COLORES.texto, marginTop: 6 },
  notaCaja: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORES.fondo,
    minHeight: 56,
  },
  notaTexto: { flex: 1, fontSize: 17, color: COLORES.texto, fontStyle: 'italic', lineHeight: 24 },
  notaVacia: { flex: 1, fontSize: 17, color: COLORES.textoTenue },
  inputNota: {
    minHeight: 110,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: 14,
    fontSize: 17,
    color: COLORES.texto,
  },
  contador: { alignSelf: 'flex-end', fontSize: 14, color: COLORES.textoTenue },
  filaBotones: { flexDirection: 'row', gap: 10 },
});
