import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { estadoVisible } from '@/src/agenda/logicaAgenda';
import { COLORES, RADIO } from '@/src/configuracion/tema';
import type { Evento } from '@/src/tipos/evento';
import { desdeISO, formatearHora, formatearPrecio } from '@/src/utils/fechas';
import { EtiquetaEstadoEvento } from './EtiquetaEstadoEvento';

interface TarjetaEventoProps {
  evento: Evento;
  /** Nombre del lugar del catálogo, o null si no tiene / no existe. */
  nombreLugar: string | null;
  guardado: boolean;
  ahora: Date;
  /** Muestra la fecha además de la hora (vista "Guardados"). */
  conFecha?: string;
  onPress: () => void;
}

export function TarjetaEvento({ evento, nombreLugar, guardado, ahora, conFecha, onPress }: TarjetaEventoProps) {
  const inicio = desdeISO(evento.inicio);
  const estado = estadoVisible(evento, ahora);
  const apagado = estado !== 'programado';
  const donde = nombreLugar ?? evento.direccionLibre ?? 'Lugar a confirmar';
  const precio = formatearPrecio(evento.precio);

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${inicio ? formatearHora(inicio) : ''} ${evento.titulo}, en ${donde}${apagado ? `, ${estado}` : ''}${guardado ? ', guardado' : ''}`}
      style={[styles.tarjeta, apagado && styles.tarjetaApagada]}>
      <View style={styles.columnaHora}>
        <Text style={[styles.hora, apagado && styles.textoTachado]}>{inicio ? formatearHora(inicio) : '--:--'}</Text>
        {conFecha ? <Text style={styles.fecha}>{conFecha}</Text> : null}
        {guardado ? <Ionicons name="bookmark" size={22} color={COLORES.primario} accessibilityLabel="Guardado" /> : null}
      </View>

      <View style={styles.cuerpo}>
        <EtiquetaEstadoEvento estado={estado} />
        <Text style={[styles.titulo, apagado && styles.textoTachado]} numberOfLines={2}>
          {evento.titulo}
        </Text>
        <View style={styles.filaDato}>
          <Ionicons name="location-outline" size={16} color={COLORES.textoSecundario} />
          <Text style={styles.dato} numberOfLines={1}>
            {donde}
          </Text>
        </View>
        {precio ? (
          <Text style={[styles.precio, evento.precio === 0 && styles.gratis]}>{precio}</Text>
        ) : null}
      </View>

      {evento.imagenUrl ? (
        <Image source={{ uri: evento.imagenUrl }} style={styles.imagen} contentFit="cover" cachePolicy="disk" />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO,
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  tarjetaApagada: { backgroundColor: '#F1F3F5' },
  columnaHora: { width: 64, alignItems: 'flex-start', gap: 6 },
  hora: { fontSize: 20, fontWeight: '800', color: COLORES.texto },
  fecha: { fontSize: 13, color: COLORES.textoSecundario, fontWeight: '600' },
  cuerpo: { flex: 1, gap: 4 },
  titulo: { fontSize: 17, fontWeight: '700', color: COLORES.texto },
  textoTachado: { color: COLORES.textoTenue },
  filaDato: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dato: { flex: 1, fontSize: 15, color: COLORES.textoSecundario },
  precio: { fontSize: 15, fontWeight: '700', color: COLORES.texto },
  gratis: { color: COLORES.exito },
  imagen: { width: 72, height: 72, borderRadius: 10, backgroundColor: COLORES.fondo },
});
