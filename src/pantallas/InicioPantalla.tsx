import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EstadoVacio } from '@/src/componentes/estados/EstadoVacio';
import { ListaCercaTuyo } from '@/src/componentes/cerca-tuyo/ListaCercaTuyo';
import { FiltroCategoria } from '@/src/componentes/mapa/FiltroCategoria';
import { MapaLugares } from '@/src/componentes/mapa/MapaLugares';
import { FlechaOrientacion } from '@/src/componentes/orientacion/FlechaOrientacion';
import { PREFERENCIAS_POR_DEFECTO } from '@/src/configuracion/preferenciasPorDefecto';
import { useAvisosProximidad } from '@/src/hooks/useAvisosProximidad';
import { type LugarCercano, useLugaresCercanos } from '@/src/hooks/useLugaresCercanos';
import { usePosicionUsuario } from '@/src/hooks/usePosicionUsuario';
import { rutaDetalleLugar } from '@/src/navegacion/rutas';
import type { Categoria } from '@/src/tipos/categoria';

type Vista = 'mapa' | 'lista';

export function InicioPantalla() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
  const [vista, setVista] = useState<Vista>('mapa');

  const { estado: estadoPosicion, posicion, precisionMetros, reintentar: reintentarPosicion } =
    usePosicionUsuario();

  const { lugares, estado: estadoLugares, reintentar: reintentarLugares } = useLugaresCercanos(
    posicion,
    categoriaSeleccionada
  );

  useAvisosProximidad({
    lugares,
    posicion,
    precisionMetros,
    preferencias: PREFERENCIAS_POR_DEFECTO,
  });

  function verDetalle(lugar: LugarCercano) {
    router.push(rutaDetalleLugar(lugar.id));
  }

  const lugarParaFlecha = posicion ? lugares[0] ?? null : null;

  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Mi Ciudad Colón</Text>
        <SelectorVista vista={vista} onCambiar={setVista} />
      </View>

      <FiltroCategoria
        categoriaSeleccionada={categoriaSeleccionada}
        onCambiarCategoria={setCategoriaSeleccionada}
      />

      <AvisoPosicion estado={estadoPosicion} onReintentar={reintentarPosicion} />

      <View style={styles.contenido}>
        {estadoLugares === 'cargando' ? (
          <ActivityIndicator style={styles.cargando} size="large" />
        ) : estadoLugares === 'error' ? (
          <EstadoVacio
            icono="cloud-offline-outline"
            titulo="No se pudo cargar el catálogo de lugares"
            descripcion="Revisá tu conexión e intentá de nuevo."
            textoBoton="Reintentar"
            onPresionarBoton={reintentarLugares}
          />
        ) : lugares.length === 0 ? (
          <EstadoVacio icono="location-outline" titulo="No hay lugares para esta categoría" />
        ) : vista === 'mapa' ? (
          <View style={styles.mapaContenedor}>
            <MapaLugares lugares={lugares} posicionUsuario={posicion} onVerDetalle={verDetalle} />
            <View style={styles.flechaFlotante}>
              <FlechaOrientacion lugar={lugarParaFlecha} posicionUsuario={posicion} />
            </View>
          </View>
        ) : (
          <ListaCercaTuyo lugares={lugares} onVerDetalle={verDetalle} />
        )}
      </View>
    </SafeAreaView>
  );
}

function SelectorVista({ vista, onCambiar }: { vista: Vista; onCambiar: (vista: Vista) => void }) {
  return (
    <View style={styles.selector}>
      <BotonSelector
        etiqueta="Mapa"
        icono="map"
        activo={vista === 'mapa'}
        onPress={() => onCambiar('mapa')}
      />
      <BotonSelector
        etiqueta="Cerca tuyo"
        icono="list"
        activo={vista === 'lista'}
        onPress={() => onCambiar('lista')}
      />
    </View>
  );
}

function BotonSelector({
  etiqueta,
  icono,
  activo,
  onPress,
}: {
  etiqueta: string;
  icono: ComponentProps<typeof Ionicons>['name'];
  activo: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      style={[styles.botonSelector, activo && styles.botonSelectorActivo]}>
      <Ionicons name={icono} size={16} color={activo ? '#fff' : '#339AF0'} />
      <Text style={[styles.botonSelectorTexto, activo && styles.botonSelectorTextoActivo]}>{etiqueta}</Text>
    </TouchableOpacity>
  );
}

function AvisoPosicion({
  estado,
  onReintentar,
}: {
  estado: 'cargando' | 'concedido' | 'denegado' | 'error';
  onReintentar: () => void;
}) {
  if (estado === 'concedido' || estado === 'cargando') return null;

  const mensaje =
    estado === 'denegado'
      ? 'Ubicación desactivada: mostrando lugares ordenados por nombre.'
      : 'No se pudo obtener tu ubicación.';

  return (
    <View style={styles.avisoPosicion}>
      <Text style={styles.avisoPosicionTexto} numberOfLines={2}>
        {mensaje}
      </Text>
      <TouchableOpacity onPress={onReintentar} accessibilityRole="button">
        <Text style={styles.avisoPosicionBoton}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#fff',
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
  },
  selector: {
    flexDirection: 'row',
    gap: 6,
  },
  botonSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#339AF0',
  },
  botonSelectorActivo: {
    backgroundColor: '#339AF0',
  },
  botonSelectorTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#339AF0',
  },
  botonSelectorTextoActivo: {
    color: '#fff',
  },
  avisoPosicion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginHorizontal: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFF3BF',
  },
  avisoPosicionTexto: {
    flex: 1,
    fontSize: 12,
    color: '#5C4A00',
  },
  avisoPosicionBoton: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C4A00',
  },
  contenido: {
    flex: 1,
  },
  cargando: {
    flex: 1,
  },
  mapaContenedor: {
    flex: 1,
  },
  flechaFlotante: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    alignItems: 'flex-start',
  },
});
