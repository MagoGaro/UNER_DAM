import * as ImagePicker from 'expo-image-picker';

/**
 * Elegir una foto ya sacada (expo-image-picker). Devuelve la URI o null
 * si el turista canceló o negó el permiso; nunca tira.
 */
export async function elegirFotoDeGaleria(): Promise<{ uri: string | null; permisoDenegado: boolean }> {
  try {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) return { uri: null, permisoDenegado: true };
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: false,
    });
    if (resultado.canceled || !resultado.assets?.length) return { uri: null, permisoDenegado: false };
    return { uri: resultado.assets[0].uri, permisoDenegado: false };
  } catch {
    return { uri: null, permisoDenegado: false };
  }
}
