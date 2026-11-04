import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraBusqueda } from '@/src/componentes/mapa/BarraBusqueda';
import { EstadoVacio } from '@/src/componentes/estados/EstadoVacio';
import { HojaCercaTuyo } from '@/src/componentes/cerca-tuyo/HojaCercaTuyo';
import { ListaCercaTuyo } from '@/src/componentes/cerca-tuyo/ListaCercaTuyo';
import { FiltroCategoria } from '@/src/componentes/mapa/FiltroCategoria';
import { MapaLugares } from '@/src/componentes/mapa/MapaLugares';
import { FlechaOrientacion } from '@/src/componentes/orientacion/FlechaOrientacion';
import { PREFERENCIAS_POR_DEFECTO } from '@/src/configuracion/preferenciasPorDefecto';
import { useAvisosProximidad } from '@/src/hooks/useAvisosProximidad';
import { useCategorias } from '@/src/hooks/useCategorias';
import { useSesion } from '@/src/sesion';
import { type LugarCercano, useLugaresCercanos } from '@/src/hooks/useLugaresCercanos';
import { usePosicionUsuario } from '@/src/hooks/usePosicionUsuario';
import { rutaDetalleLugar } from '@/src/navegacion/rutas';
import { MENSAJE_PROBLEMA_SERVIDOR, TITULO_PROBLEMA_SERVIDOR } from '@/src/servicios/api/mensajes';

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function InicioPantalla() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [filtrosVisibles, setFiltrosVisibles] = useState(true);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const inputBusquedaRef = useRef<TextInput>(null);

  const { estado: estadoPosicion, posicion, precisionMetros, reintentar: reintentarPosicion } =
    usePosicionUsuario();

  const { usuario } = useSesion();
  const { categorias } = useCategorias();

  const { lugares, estado: estadoLugares, reintentar: reintentarLugares } = useLugaresCercanos(
    posicion,
    categoriaSeleccionada
  );

  useAvisosProximidad({
    lugares,
    posicion,
    precisionMetros,
    preferencias: usuario?.preferencias ?? PREFERENCIAS_POR_DEFECTO,
  });

  const lugaresFiltrados = useMemo(() => {
    const busqueda = normalizar(textoBusqueda);
    if (!busqueda) return lugares;
    return lugares.filter((lugar) => normalizar(lugar.nombre).includes(busqueda));
  }, [lugares, textoBusqueda]);

  function verDetalle(lugar: LugarCercano) {
    router.push(rutaDetalleLugar(lugar.id));
  }

  const lugarParaFlecha = posicion ? lugaresFiltrados[0] ?? null : null;

  return (
    <View style={styles.contenedor}>
      <MapaLugares lugares={lugaresFiltrados} posicionUsuario={posicion} onVerDetalle={verDetalle} />

      <SafeAreaView style={styles.overlaySuperior} edges={['top']} pointerEvents="box-none">
        <View style={styles.encabezado}>
          <Text style={styles.titulo}>Colón</Text>
          <TouchableOpacity
            onPress={() => inputBusquedaRef.current?.focus()}
            accessibilityRole="button"
            accessibilityLabel="Buscar"
            style={styles.botonBuscarHeader}>
            <Ionicons name="search" size={22} color="#212529" />
          </TouchableOpacity>
        </View>

        <BarraBusqueda
          ref={inputBusquedaRef}
          valor={textoBusqueda}
          onCambiarValor={setTextoBusqueda}
          filtrosVisibles={filtrosVisibles}
          onCambiarFiltrosVisibles={setFiltrosVisibles}
        />

        {filtrosVisibles ? (
          <FiltroCategoria
            categorias={categorias}
            categoriaSeleccionada={categoriaSeleccionada}
            onCambiarCategoria={setCategoriaSeleccionada}
          />
        ) : null}

        <AvisoPosicion estado={estadoPosicion} onReintentar={reintentarPosicion} />
      </SafeAreaView>

      <View style={styles.flechaFlotante} pointerEvents="box-none">
        <FlechaOrientacion lugar={lugarParaFlecha} posicionUsuario={posicion} />
      </View>

      <HojaCercaTuyo titulo="Cerca tuyo">
        {estadoLugares === 'cargando' ? (
          <ActivityIndicator style={styles.cargando} size="large" />
        ) : estadoLugares === 'error' ? (
          <EstadoVacio
            icono="cloud-offline-outline"
            titulo={TITULO_PROBLEMA_SERVIDOR}
            descripcion={MENSAJE_PROBLEMA_SERVIDOR}
            textoBoton="Reintentar"
            onPresionarBoton={reintentarLugares}
          />
        ) : (
          <ListaCercaTuyo lugares={lugaresFiltrados} onVerDetalle={verDetalle} />
        )}
      </HojaCercaTuyo>
    </View>
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
  overlaySuperior: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#E8590C',
  },
  botonBuscarHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  avisoPosicion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 4,
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
  flechaFlotante: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 166,
    alignItems: 'flex-start',
  },
  cargando: {
    marginTop: 24,
  },
});
