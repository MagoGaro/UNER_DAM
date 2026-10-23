import { Directory, File, Paths } from 'expo-file-system';

/**
 * Las fotos que saca la cámara o elige la galería quedan en una carpeta
 * temporal que el sistema puede borrar. Al registrar la visita se copian
 * a `documentos/visitas/`, que es permanente y funciona sin señal.
 * Usa la API nueva de expo-file-system (File / Directory / Paths): la
 * vieja tira error en tiempo de ejecución en SDK 54.
 */
function carpetaVisitas(): Directory {
  const carpeta = new Directory(Paths.document, 'visitas');
  if (!carpeta.exists) carpeta.create({ idempotent: true, intermediates: true });
  return carpeta;
}

export function guardarFotoPermanente(uriTemporal: string, visitaId: string): string {
  try {
    const origen = new File(uriTemporal);
    const extension = (origen.extension || '.jpg').toLowerCase();
    const destino = new File(carpetaVisitas(), `${visitaId}-${Date.now()}${extension}`);
    origen.copy(destino);
    return destino.uri;
  } catch {
    // Si no se pudo copiar, se usa la ruta original: mejor una foto que puede perderse que ninguna.
    return uriTemporal;
  }
}

export function borrarFoto(uri: string | null): void {
  if (!uri) return;
  try {
    const archivo = new File(uri);
    if (archivo.exists && archivo.uri.includes('/visitas/')) archivo.delete();
  } catch {
    // nada
  }
}
