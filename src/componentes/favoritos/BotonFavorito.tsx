import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';

import { COLORES } from '@/src/configuracion/tema';
import { favoritos, useFavoritos } from '@/src/favoritos';

/** Corazón de un toque para marcar un lugar como favorito. Funciona sin cuenta y sin señal. */
export function BotonFavorito({ lugarId, nombre }: { lugarId: string; nombre: string }) {
  const { favoritos: lista } = useFavoritos();
  const esFavorito = lista.some((f) => f.lugarId === lugarId);

  const alternar = async () => {
    const queda = await favoritos.alternar(lugarId);
    if (queda) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  return (
    <Pressable
      onPress={alternar}
      accessibilityRole="button"
      accessibilityLabel={esFavorito ? `Quitar ${nombre} de favoritos` : `Agregar ${nombre} a favoritos`}
      accessibilityState={{ selected: esFavorito }}
      hitSlop={8}
      style={styles.boton}>
      <Ionicons name={esFavorito ? 'heart' : 'heart-outline'} size={28} color={esFavorito ? COLORES.peligro : COLORES.texto} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
