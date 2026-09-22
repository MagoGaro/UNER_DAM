import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

const ALTO_COLAPSADO = 150;
const PROPORCION_EXPANDIDA = 0.62;

function clamp(valor: number, minimo: number, maximo: number): number {
  return Math.min(Math.max(valor, minimo), maximo);
}

interface HojaCercaTuyoProps {
  titulo: string;
  children: ReactNode;
}

/**
 * Hoja inferior arrastrable que flota sobre el mapa, con dos posiciones
 * (achicada / expandida), para que el mapa y «Cerca tuyo» convivan en
 * pantalla en vez de alternarse. Implementada con Animated + PanResponder
 * (ya vienen con React Native) en vez de sumar una librería de bottom
 * sheet nueva, para no arriesgar compatibilidad con Reanimated 4 / la
 * New Architecture de esta versión de Expo.
 */
export function HojaCercaTuyo({ titulo, children }: HojaCercaTuyoProps) {
  const { height: alturaPantalla } = useWindowDimensions();
  const altoExpandido = Math.round(alturaPantalla * PROPORCION_EXPANDIDA);
  const desplazamientoMaximo = altoExpandido - ALTO_COLAPSADO;

  const translateY = useRef(new Animated.Value(desplazamientoMaximo)).current;
  const valorActual = useRef(desplazamientoMaximo);
  const inicioArrastre = useRef(desplazamientoMaximo);

  useEffect(() => {
    const id = translateY.addListener(({ value }) => {
      valorActual.current = value;
    });
    return () => translateY.removeListener(id);
  }, [translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesto) => Math.abs(gesto.dy) > 6,
      onPanResponderGrant: () => {
        inicioArrastre.current = valorActual.current;
        translateY.stopAnimation();
      },
      onPanResponderMove: (_, gesto) => {
        translateY.setValue(clamp(inicioArrastre.current + gesto.dy, 0, desplazamientoMaximo));
      },
      onPanResponderRelease: (_, gesto) => {
        const posicionFinal = clamp(inicioArrastre.current + gesto.dy, 0, desplazamientoMaximo);
        const destino = posicionFinal > desplazamientoMaximo / 2 ? desplazamientoMaximo : 0;
        Animated.spring(translateY, { toValue: destino, useNativeDriver: true, bounciness: 4 }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[styles.hoja, { height: altoExpandido, transform: [{ translateY }] }]}>
      <View {...panResponder.panHandlers} style={styles.encabezado}>
        <View style={styles.agarradera} />
        <Text style={styles.titulo}>{titulo}</Text>
      </View>
      <View style={styles.contenido}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hoja: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  encabezado: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  agarradera: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CED4DA',
    marginBottom: 8,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    alignSelf: 'flex-start',
    marginLeft: 16,
  },
  contenido: {
    flex: 1,
  },
});
