import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvisoBanner } from '@/src/componentes/estados/AvisoBanner';
import { EstadoVacio } from '@/src/componentes/estados/EstadoVacio';
import { TarjetaVisita } from '@/src/componentes/recorrido/TarjetaVisita';
import { COLORES } from '@/src/configuracion/tema';
import { useAhora } from '@/src/hooks/useAhora';
import { useCatalogoLugares } from '@/src/hooks/useCatalogoLugares';
import { useConexion } from '@/src/hooks/useConexion';
import { rutaDetalleVisita, rutaElegirLugar, rutaEscanearQr } from '@/src/navegacion/rutas';
import { recorrido } from '@/src/recorrido';
import type { Visita } from '@/src/tipos/visita';
import { useAlmacen } from '@/src/utils/almacen';
import { capitalizar, claveDia, desdeISO, formatearDiaRelativo } from '@/src/utils/fechas';

interface Seccion {
  titulo: string;
  data: { visita: Visita; numero: number }[];
}

export function MiRecorridoPantalla() {
  const ahora = useAhora();
  const estado = useAlmacen(recorrido.almacen);
  const conexion = useConexion();
  const { porId } = useCatalogoLugares();

  useFocusEffect(
    useCallback(() => {
      recorrido.recargar().then(() => recorrido.sincronizar());
    }, [])
  );

  const secciones = useMemo<Seccion[]>(() => {
    const grupos = new Map<string, Seccion>();
    estado.visitas.forEach((visita, i) => {
      const fecha = desdeISO(visita.fechaHora) ?? new Date(0);
      const clave = claveDia(fecha);
      if (!grupos.has(clave)) grupos.set(clave, { titulo: capitalizar(formatearDiaRelativo(fecha, ahora)), data: [] });
      grupos.get(clave)!.data.push({ visita, numero: i + 1 });
    });
    return [...grupos.values()];
  }, [estado.visitas, ahora]);

  const lugaresDistintos = new Set(estado.visitas.map((v) => v.lugarId)).size;
  const fotos = estado.visitas.filter((v) => v.fotoUri).length;
  const pendientes = estado.visitas.filter((v) => !v.sincronizada).length;
  const ultimoId = estado.visitas.at(-1)?.id;

  const acciones = (
    <View style={styles.acciones}>
      <AccionGrande icono="qr-code" texto="Escanear QR" onPress={() => router.push(rutaEscanearQr())} principal />
      <AccionGrande icono="locate" texto="Estoy acá" onPress={() => router.push(rutaElegirLugar('gps'))} />
      <AccionGrande icono="list" texto="Elegir lugar" onPress={() => router.push(rutaElegirLugar('manual'))} />
    </View>
  );

  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo} accessibilityRole="header">Mi recorrido</Text>
        {estado.visitas.length > 0 ? (
          <Text style={styles.resumen}>
            {lugaresDistintos} {lugaresDistintos === 1 ? 'lugar' : 'lugares'} · {fotos} {fotos === 1 ? 'foto' : 'fotos'}
          </Text>
        ) : null}
      </View>

      {!estado.cargado ? (
        <ActivityIndicator size="large" color={COLORES.primario} style={{ marginTop: 40 }} />
      ) : estado.errorAlCargar ? (
        <EstadoVacio
          icono="alert-circle-outline"
          titulo="No pudimos abrir tu recorrido"
          descripcion="Tus visitas siguen guardadas en el teléfono."
          textoBoton="Reintentar"
          onPresionarBoton={() => recorrido.recargar()}
        />
      ) : (
        <SectionList
          sections={secciones}
          keyExtractor={(item) => item.visita.id}
          contentContainerStyle={styles.lista}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <View style={{ gap: 12, marginBottom: 8 }}>
              {acciones}
              {pendientes > 0 ? (
                <AvisoBanner
                  tono={conexion === false ? 'aviso' : 'info'}
                  icono="cloud-upload-outline"
                  texto={
                    conexion === false
                      ? `Sin señal: ${pendientes === 1 ? 'tu visita está guardada' : `tus ${pendientes} visitas están guardadas`} en el teléfono y se suben solas cuando vuelva la conexión.`
                      : estado.sincronizando
                        ? 'Subiendo tus visitas…'
                        : `${pendientes === 1 ? 'Hay 1 visita' : `Hay ${pendientes} visitas`} esperando para subirse.`
                  }
                />
              ) : null}
            </View>
          }
          renderSectionHeader={({ section }) => <Text style={styles.dia}>{section.titulo}</Text>}
          renderItem={({ item }) => (
            <TarjetaVisita
              numero={item.numero}
              visita={item.visita}
              lugar={porId[item.visita.lugarId] ?? null}
              esUltima={item.visita.id === ultimoId}
              onPress={() => router.push(rutaDetalleVisita(item.visita.id))}
            />
          )}
          ListEmptyComponent={
            <View style={styles.vacio}>
              <Ionicons name="footsteps-outline" size={56} color={COLORES.primario} />
              <Text style={styles.vacioTitulo}>Tu recorrido empieza acá</Text>
              <Text style={styles.vacioTexto}>
                Cuando llegues a un lugar, escaneá el QR del cartel o tocá «Estoy acá». Podés sumar una foto y una nota.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function AccionGrande({
  icono,
  texto,
  onPress,
  principal,
}: {
  icono: 'qr-code' | 'locate' | 'list';
  texto: string;
  onPress: () => void;
  principal?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.accion, principal && styles.accionPrincipal]}>
      <Ionicons name={icono} size={30} color={principal ? '#fff' : COLORES.primario} />
      <Text style={[styles.accionTexto, principal && { color: '#fff' }]} numberOfLines={2}>
        {texto}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.fondo },
  encabezado: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  titulo: { fontSize: 30, fontWeight: '800', color: COLORES.texto },
  resumen: { fontSize: 16, fontWeight: '600', color: COLORES.textoSecundario },
  lista: { padding: 16, paddingBottom: 40, flexGrow: 1 },
  acciones: { flexDirection: 'row', gap: 10 },
  accion: {
    flex: 1,
    minHeight: 96,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORES.primario,
    backgroundColor: COLORES.superficie,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 8,
  },
  accionPrincipal: { backgroundColor: COLORES.primario },
  accionTexto: { fontSize: 15, fontWeight: '800', color: COLORES.primario, textAlign: 'center' },
  dia: { fontSize: 18, fontWeight: '800', color: COLORES.texto, marginTop: 8, marginBottom: 10 },
  vacio: { alignItems: 'center', gap: 10, paddingVertical: 32, paddingHorizontal: 16 },
  vacioTitulo: { fontSize: 20, fontWeight: '800', color: COLORES.texto, textAlign: 'center' },
  vacioTexto: { fontSize: 16, color: COLORES.textoSecundario, textAlign: 'center', lineHeight: 23 },
});
