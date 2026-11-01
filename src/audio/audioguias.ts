import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { ErrorDeServicio } from '@/src/tipos/api';
import type { Lugar } from '@/src/tipos/lugar';

/** Audioguías que ya viajan dentro de la app (siempre funcionan sin señal). */
const AUDIOS_INCLUIDOS: Record<string, number> = {
  'lug-004': require('@/assets/audio/molino_forclaz.mp3'),
};

export type FuenteAudio = number | { uri: string };

export function estaIncluidaEnLaApp(lugarId: string): boolean {
  return lugarId in AUDIOS_INCLUIDOS;
}

/** Elige de dónde se reproduce: lo que viene en la app, lo descargado, o internet. */
export function elegirFuente(datos: { lugarId: string; urlRemota: string | null; uriLocal: string | null }): FuenteAudio | null {
  const incluida = AUDIOS_INCLUIDOS[datos.lugarId];
  if (incluida !== undefined) return incluida;
  if (datos.uriLocal) return { uri: datos.uriLocal };
  if (datos.urlRemota) return { uri: datos.urlRemota };
  return null;
}

/** Nombre estable del archivo: un archivo por lugar e idioma, con la extensión de la URL. */
export function nombreArchivoAudioguia(lugarId: string, idioma: string, url: string): string {
  const limpia = url.split('?')[0].split('#')[0];
  const punto = limpia.lastIndexOf('.');
  const extension = punto > limpia.lastIndexOf('/') ? limpia.slice(punto + 1).toLowerCase() : 'm4a';
  const segura = /^[a-z0-9]{1,5}$/.test(extension) ? extension : 'm4a';
  return `${lugarId}-${idioma}.${segura}`;
}

const hayArchivos = Platform.OS !== 'web';

function carpeta(): Directory {
  return new Directory(Paths.document, 'audioguias');
}

function archivoDe(lugar: Lugar): File | null {
  if (!hayArchivos || !lugar.audioguia) return null;
  return new File(carpeta(), nombreArchivoAudioguia(lugar.id, lugar.audioguia.idioma, lugar.audioguia.url));
}

/** Ruta del archivo descargado, o null si no está en el teléfono. */
export function rutaAudioguiaLocal(lugar: Lugar): string | null {
  try {
    const archivo = archivoDe(lugar);
    return archivo && archivo.exists && archivo.size > 0 ? archivo.uri : null;
  } catch {
    return null;
  }
}

/** Baja la audioguía al teléfono para usarla sin señal. Devuelve la ruta local. */
export async function descargarAudioguia(lugar: Lugar): Promise<string> {
  const archivo = archivoDe(lugar);
  if (!archivo || !lugar.audioguia) {
    throw new ErrorDeServicio('SIN_AUDIOGUIA', 'Este lugar no tiene audioguía para descargar.');
  }
  try {
    carpeta().create({ intermediates: true, idempotent: true });
    await File.downloadFileAsync(lugar.audioguia.url, archivo, { idempotent: true });
    if (!archivo.exists || archivo.size === 0) throw new Error('vacío');
    return archivo.uri;
  } catch {
    try {
      if (archivo.exists) archivo.delete();
    } catch {
      // Si no se puede limpiar, la próxima descarga lo pisa (idempotent).
    }
    throw new ErrorDeServicio('DESCARGA_FALLIDA', 'No se pudo descargar. Revisá tu conexión y probá de nuevo.');
  }
}

export function borrarAudioguia(lugar: Lugar): void {
  try {
    const archivo = archivoDe(lugar);
    if (archivo?.exists) archivo.delete();
  } catch {
    // Nada que borrar o ya no se puede: el estado se vuelve a leer del disco.
  }
}

export interface ResumenDescarga {
  descargadas: number;
  fallidas: number;
  yaEstaban: number;
}

/** Deja en el teléfono todas las audioguías (para El Palmar, donde no hay señal). */
export async function descargarTodas(
  lugares: readonly Lugar[],
  alProgreso?: (hechas: number, total: number) => void
): Promise<ResumenDescarga> {
  const conAudio = lugares.filter((l) => l.audioguia && !estaIncluidaEnLaApp(l.id));
  const resumen: ResumenDescarga = { descargadas: 0, fallidas: 0, yaEstaban: 0 };
  let hechas = 0;
  for (const lugar of conAudio) {
    if (rutaAudioguiaLocal(lugar)) {
      resumen.yaEstaban += 1;
    } else {
      try {
        await descargarAudioguia(lugar);
        resumen.descargadas += 1;
      } catch {
        resumen.fallidas += 1;
      }
    }
    hechas += 1;
    alProgreso?.(hechas, conAudio.length);
  }
  return resumen;
}
