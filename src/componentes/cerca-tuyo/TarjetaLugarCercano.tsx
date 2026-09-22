import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { LugarCercano } from '@/src/hooks/useLugaresCercanos';
import { abrirComoLlegar, type ModoViaje } from '@/src/navegacion/abrirComoLlegar';
import { obtenerMetadatoCategoria } from '@/src/tipos/categoria';

interface TarjetaLugarCercanoProps {
  lugar: LugarCercano;
  onVerDetalle: (lugar: LugarCercano) => void;
}

function colorDistancia(metros: number | null): string {
  if (metros === null) return '#868E96';
  if (metros < 1000) return '#2F9E44';
  if (metros < 3000) return '#F08C00';
  return '#495057';
}

/**
 * Tarjeta de la lista «Cerca tuyo»: foto, puntaje, distancia y «Cómo
 * llegar» (tareas 4 y 5). El botón «ver detalle» y los de «cómo llegar»
 * son hermanos, no uno anidado dentro del otro: un botón dentro de otro
 * botón es HTML inválido (se ve en la consola web) y en la práctica
 * hace que el clic interno dispare también el externo.
 */
export function TarjetaLugarCercano({ lugar, onVerDetalle }: TarjetaLugarCercanoProps) {
  const metadato = obtenerMetadatoCategoria(lugar.categoria);

  async function comoLlegar(modo: ModoViaje) {
    const abierto = await abrirComoLlegar(lugar.coordenadas, modo);
    if (!abierto) {
      Alert.alert('No se pudo abrir el mapa', 'Instalá Google Maps o Apple Maps para trazar la ruta.');
    }
  }

  return (
    <View style={styles.tarjeta}>
      <TouchableOpacity
        onPress={() => onVerDetalle(lugar)}
        accessibilityRole="button"
        accessibilityLabel={`Ver detalle de ${lugar.nombre}`}
        style={styles.filaPrincipal}>
        {lugar.imagenUrl ? (
          <Image source={{ uri: lugar.imagenUrl }} style={styles.imagen} contentFit="cover" />
        ) : (
          <View style={[styles.imagen, styles.imagenAusente, { backgroundColor: metadato.color }]}>
            <Ionicons name={metadato.icono} size={26} color="#fff" />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.nombre} numberOfLines={1}>
            {lugar.nombre}
          </Text>

          {lugar.calificacion !== undefined ? (
            <View style={styles.filaCalificacion}>
              <Ionicons name="star" size={13} color="#F59F00" />
              <Text style={styles.calificacion}>{lugar.calificacion.toFixed(1)}</Text>
            </View>
          ) : null}

          {lugar.descripcionCorta ? (
            <Text style={styles.descripcion} numberOfLines={2}>
              {lugar.descripcionCorta}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      <View style={styles.acciones}>
        <TouchableOpacity
          onPress={() => comoLlegar('caminando')}
          accessibilityRole="button"
          accessibilityLabel={`Cómo llegar a pie a ${lugar.nombre}`}
          style={styles.botonAccion}>
          <Ionicons name="walk" size={16} color="#339AF0" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => comoLlegar('auto')}
          accessibilityRole="button"
          accessibilityLabel={`Cómo llegar en auto a ${lugar.nombre}`}
          style={styles.botonAccion}>
          <Ionicons name="car" size={16} color="#339AF0" />
        </TouchableOpacity>
      </View>

      {lugar.distanciaFormateada ? (
        <View style={[styles.badgeDistancia, { backgroundColor: colorDistancia(lugar.distanciaMetros) }]}>
          <Text style={styles.badgeTexto}>{lugar.distanciaFormateada}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  filaPrincipal: {
    flexDirection: 'row',
    gap: 10,
  },
  imagen: {
    width: 76,
    height: 76,
    borderRadius: 10,
  },
  imagenAusente: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
    paddingRight: 60,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212529',
  },
  filaCalificacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calificacion: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
  },
  descripcion: {
    fontSize: 12,
    color: '#868E96',
  },
  acciones: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
    marginLeft: 86,
  },
  botonAccion: {
    padding: 4,
  },
  badgeDistancia: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
});
