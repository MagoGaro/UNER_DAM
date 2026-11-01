import { useSyncExternalStore } from 'react';

import { kvStorePersistente } from '@/src/almacenamiento/kvStore';
import { sesion } from '@/src/sesion';
import { servicioFavoritos } from '@/src/servicios/favoritos';
import { AlmacenFavoritos, type InstantaneaFavoritos } from './almacenFavoritos';

/** Instancia que usa la app (las dependencias reales). */
export const favoritos = new AlmacenFavoritos({ kv: kvStorePersistente, servicio: servicioFavoritos });

export function useFavoritos(): InstantaneaFavoritos {
  return useSyncExternalStore(favoritos.suscribir, favoritos.obtener, favoritos.obtener);
}

/**
 * Arranque de la cuenta: carga los favoritos del teléfono, recupera la
 * sesión guardada y mantiene los favoritos alineados con quien está
 * ingresado. Se llama una sola vez desde `TareasDeFondo`.
 */
export function iniciarCuenta(): () => void {
  let anterior: string | null | undefined;
  const alinear = () => {
    const s = sesion.obtener();
    if (s.estado === 'cargando' || s.estado === 'bloqueada') return;
    const id = s.estado === 'activa' && s.usuario ? s.usuario.id : null;
    if (id === anterior) return;
    anterior = id;
    favoritos.vincularUsuario(id).catch(() => {});
  };
  const baja = sesion.suscribir(alinear);
  favoritos
    .cargar()
    .then(() => sesion.iniciar())
    .then(alinear)
    .catch(() => {});
  return baja;
}
