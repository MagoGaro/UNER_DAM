import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { obtenerMetadatoCategoria } from '@/src/tipos/categoria';
import type { LugarCercano } from '@/src/hooks/useLugaresCercanos';

interface TarjetaLugarCercanoProps {
  lugar: LugarCercano;
  onVerDetalle: (lugar: LugarCercano) => void;
}

export function TarjetaLugarCercano({ lugar, onVerDetalle }: TarjetaLugarCercanoProps) {
  // El catálogo trae `categoriaId` ("cat-museos"); `categoria` es opcional y
  // los mocks no lo cargan, por eso antes todas las tarjetas decían "Lugar".
  const metadato = obtenerMetadatoCategoria(lugar.categoriaId ?? lugar.categoria);
  const colorChip = metadato.color;
  const etiquetaCategoria = metadato.etiqueta;

  return (
    <Pressable style={styles.tarjeta} onPress={() => onVerDetalle(lugar)}>
      <Image
        source={{ uri: lugar.imagenes[0] ?? lugar.imagenUrl }}
        style={styles.imagen}
        contentFit="cover"
        cachePolicy="disk"
      />
      <View style={styles.contenido}>
        <View style={styles.encabezado}>
          <Text style={styles.nombre} numberOfLines={1}>
            {lugar.nombre}
          </Text>
          <View style={[styles.badge, { backgroundColor: colorChip }]}>
            <Text style={styles.badgeTexto}>{etiquetaCategoria}</Text>
          </View>
        </View>

        <Text style={styles.descripcion} numberOfLines={2}>
          {lugar.descripcionCorta}
        </Text>

        {/* Fila inferior: Distancia e indicador de accesibilidad (Si / No) */}
        <View style={styles.pieTarjeta}>
          {lugar.distanciaFormateada ? (
            <Text style={styles.distancia}>
              <Ionicons name="navigate-outline" size={12} /> {lugar.distanciaFormateada}
            </Text>
          ) : (
            <View />
          )}

          <View
            style={[
              styles.chipAccesible,
              lugar.accesible ? styles.chipSi : styles.chipNo,
            ]}
          >
            <MaterialIcons
              name="accessible"
              size={12}
              color={lugar.accesible ? '#2E9E4C' : '#E03131'}
            />
            <Text
              style={[
                styles.textoChipAccesible,
                { color: lugar.accesible ? '#2E9E4C' : '#E03131' },
              ]}
            >
              {lugar.accesible ? 'Accesible' : 'No accesible'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  imagen: {
    width: 100,
    height: 100,
  },
  contenido: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  nombre: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A2530',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeTexto: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  descripcion: {
    fontSize: 12,
    color: '#5C6B7A',
    marginVertical: 4,
  },
  pieTarjeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  distancia: {
    fontSize: 12,
    color: '#0B5394',
    fontWeight: '600',
  },
  chipAccesible: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipSi: {
    backgroundColor: '#E6FCF5',
    borderColor: '#B2F2BB',
  },
  chipNo: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFC9C9',
  },
  textoChipAccesible: {
    fontSize: 10,
    fontWeight: '700',
  },
});