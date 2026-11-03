import { useSyncExternalStore } from 'react';

import { agenda } from '@/src/agenda/almacenAgenda';
import { kvStorePersistente } from '@/src/almacenamiento/kvStore';
import { registrarDispositivo } from '@/src/notificaciones/registroPush';
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
 * sesión guardada y mantiene alineados con quien está ingresado los
 * favoritos, los eventos guardados y el registro del teléfono para las push. Se llama una sola vez desde `TareasDeFondo`.
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
    if (id) {
      // Con sesión: la API sabe a quién avisar de los eventos guardados y a qué teléfono mandar la push.
      agenda.sincronizarGuardados().catch(() => {});
      registrarDispositivo().catch(() => {});
    }
  };
  const baja = sesion.suscribir(alinear);
  favoritos
    .cargar()
    .then(() => sesion.iniciar())
    .then(alinear)
    .catch(() => {});
  return baja;
}
