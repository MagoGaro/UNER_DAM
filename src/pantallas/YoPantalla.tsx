import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { descargarTodas, estaIncluidaEnLaApp, rutaAudioguiaLocal } from '@/src/audio/audioguias';
import { FormularioCuenta } from '@/src/componentes/cuenta/FormularioCuenta';
import { AvisoBanner } from '@/src/componentes/estados/AvisoBanner';
import { Boton } from '@/src/componentes/estados/Boton';
import { COLORES } from '@/src/configuracion/tema';
import { favoritos, useFavoritos } from '@/src/favoritos';
import { useCatalogoLugares } from '@/src/hooks/useCatalogoLugares';
import { rutaDetalleLugar } from '@/src/navegacion/rutas';
import { sesion, useSesion } from '@/src/sesion';
import { RADIOS_AVISO_METROS } from '@/src/tipos/preferencias';

export function YoPantalla() {
  const { estado, usuario, ocupado, error, biometriaDisponible, biometriaActivada } = useSesion();
  const { favoritos: lista, sincronizando } = useFavoritos();
  const { lugares, porId } = useCatalogoLugares();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [descargando, setDescargando] = useState<string | null>(null);

  const conAudio = useMemo(() => lugares.filter((l) => l.audioguia && !estaIncluidaEnLaApp(l.id)), [lugares]);
  // Se recalcula en cada render: depende de lo que hay en el disco, y al terminar una descarga cambia `descargando`.
  const pendientesDeBajar = conAudio.filter((l) => !rutaAudioguiaLocal(l)).length;

  const bajarTodas = async () => {
    setMensaje(null);
    setDescargando(`0 de ${conAudio.length}`);
    const r = await descargarTodas(conAudio, (hechas, total) => setDescargando(`${hechas} de ${total}`));
    setDescargando(null);
    setMensaje(
      r.fallidas > 0
        ? `Se guardaron ${r.descargadas}. ${r.fallidas} no se pudieron bajar: probá de nuevo con señal.`
        : 'Listo: las audioguías quedaron en tu teléfono y funcionan sin señal.'
    );
  };

  if (estado === 'cargando') {
    return (
      <SafeAreaView style={styles.centro}>
        <ActivityIndicator size="large" color={COLORES.primario} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Yo</Text>

        {estado === 'bloqueada' && (
          <View style={styles.tarjeta}>
            <Text style={styles.subtitulo}>Hola{usuario ? `, ${usuario.nombre}` : ''}</Text>
            <Text style={styles.texto}>Tu sesión está guardada. Confirmá con tu huella o rostro para entrar.</Text>
            {error ? <AvisoBanner texto={error} tono="peligro" /> : null}
            <Boton texto="Entrar con huella o rostro" icono="finger-print" onPress={() => sesion.desbloquear()} cargando={ocupado} />
            <Boton texto="Usar contraseña" variante="secundario" onPress={() => sesion.usarContrasena()} />
          </View>
        )}

        {estado === 'invitado' && (
          <View style={styles.tarjeta}>
            <Text style={styles.subtitulo}>Guardá tu recorrido</Text>
            <Text style={styles.texto}>
              No hace falta una cuenta para ver el mapa y los lugares. Con una cuenta tus favoritos y tu recorrido siguen
              estando si cambiás de teléfono o volvés el año que viene.
            </Text>
            <FormularioCuenta />
          </View>
        )}

        {estado === 'activa' && usuario && (
          <>
            <View style={styles.tarjeta}>
              <View style={styles.perfil}>
                <Ionicons name="person-circle" size={56} color={COLORES.primario} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.subtitulo}>{usuario.nombre}</Text>
                  <Text style={styles.texto}>{usuario.email}</Text>
                </View>
              </View>
              {biometriaDisponible && (
                <View style={styles.filaSwitch}>
                  <Text style={styles.textoSwitch}>Entrar con huella o rostro</Text>
                  <Switch
                    value={biometriaActivada}
                    onValueChange={async (v) => {
                      const r = await sesion.activarBiometria(v);
                      setMensaje(r.ok ? null : (r.error ?? null));
                    }}
                    accessibilityLabel="Entrar con huella o rostro"
                  />
                </View>
              )}
            </View>

            <View style={styles.tarjeta}>
              <Text style={styles.subtitulo}>Avisos de cercanía</Text>
              <View style={styles.filaSwitch}>
                <Text style={styles.textoSwitch}>Avisarme cuando llego a un lugar</Text>
                <Switch
                  value={usuario.preferencias.avisarProximidad}
                  onValueChange={(v) => {
                    sesion.guardarPreferencias({ ...usuario.preferencias, avisarProximidad: v });
                  }}
                  accessibilityLabel="Avisarme cuando llego a un lugar"
                />
              </View>
              {usuario.preferencias.avisarProximidad && (
                <View style={styles.fila}>
                  {RADIOS_AVISO_METROS.map((m) => {
                    const activo = usuario.preferencias.radioAvisoMetros === m;
                    return (
                      <TouchableOpacity
                        key={m}
                        style={[styles.chip, activo && styles.chipActivo]}
                        onPress={() => sesion.guardarPreferencias({ ...usuario.preferencias, radioAvisoMetros: m })}
                        accessibilityRole="button"
                        accessibilityState={{ selected: activo }}
                        accessibilityLabel={`Avisar a ${m} metros`}>
                        <Text style={[styles.textoChip, activo && styles.textoChipActivo]}>{m} m</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </>
        )}

        <View style={styles.tarjeta}>
          <View style={styles.fila}>
            <Text style={[styles.subtitulo, { flex: 1 }]}>Mis favoritos</Text>
            {sincronizando && <ActivityIndicator color={COLORES.primario} />}
          </View>
          {lista.length === 0 ? (
            <Text style={styles.texto}>Tocá el corazón en el detalle de un lugar para guardarlo acá.</Text>
          ) : (
            lista.map((f) => {
              const lugar = porId[f.lugarId];
              return (
                <View key={f.id} style={styles.filaFavorito}>
                  <TouchableOpacity
                    style={styles.favoritoTexto}
                    onPress={() => lugar && router.push(rutaDetalleLugar(lugar.id))}
                    disabled={!lugar}
                    accessibilityRole="button">
                    <Text style={styles.nombreFavorito}>{lugar?.nombre ?? 'Lugar no disponible'}</Text>
                    {lugar ? <Text style={styles.texto}>{lugar.descripcionCorta}</Text> : null}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quitar}
                    onPress={() => favoritos.alternar(f.lugarId)}
                    accessibilityRole="button"
                    accessibilityLabel={`Quitar ${lugar?.nombre ?? 'lugar'} de favoritos`}>
                    <Ionicons name="heart" size={26} color={COLORES.peligro} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
          {estado === 'invitado' && lista.length > 0 && (
            <AvisoBanner texto="Creá una cuenta para no perder tus favoritos si cambiás de teléfono." tono="info" />
          )}
        </View>

        {conAudio.length > 0 && (
          <View style={styles.tarjeta}>
            <Text style={styles.subtitulo}>Sin señal</Text>
            <Text style={styles.texto}>
              Dentro del Parque El Palmar casi no hay señal. Dejá las audioguías guardadas en tu teléfono antes de ir.
            </Text>
            {pendientesDeBajar === 0 && !descargando ? (
              <AvisoBanner texto="Todas las audioguías están guardadas en tu teléfono." tono="exito" />
            ) : (
              <Boton
                texto={descargando ? `Descargando… ${descargando}` : `Guardar ${pendientesDeBajar} audioguías`}
                icono="download-outline"
                onPress={bajarTodas}
                cargando={Boolean(descargando)}
              />
            )}
          </View>
        )}

        {mensaje ? <AvisoBanner texto={mensaje} tono="info" /> : null}

        {estado === 'activa' && (
          <Boton texto="Cerrar sesión" icono="log-out-outline" variante="peligro" onPress={() => sesion.cerrarSesion()} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.fondo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORES.fondo },
  scroll: { padding: 16, gap: 16, paddingBottom: 32 },
  titulo: { fontSize: 30, fontWeight: '900', color: COLORES.texto },
  tarjeta: {
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  subtitulo: { fontSize: 20, fontWeight: '800', color: COLORES.texto },
  texto: { fontSize: 16, lineHeight: 22, color: COLORES.textoSecundario },
  perfil: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filaSwitch: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 48 },
  textoSwitch: { flex: 1, fontSize: 17, fontWeight: '600', color: COLORES.texto },
  chip: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORES.borde,
  },
  chipActivo: { borderColor: COLORES.primario, backgroundColor: COLORES.primarioClaro },
  textoChip: { fontSize: 16, fontWeight: '700', color: COLORES.textoSecundario },
  textoChipActivo: { color: COLORES.primario },
  filaFavorito: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 56 },
  favoritoTexto: { flex: 1, gap: 2 },
  nombreFavorito: { fontSize: 17, fontWeight: '800', color: COLORES.texto },
  quitar: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
