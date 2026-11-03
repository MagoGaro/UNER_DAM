import { useSyncExternalStore } from 'react';

import { kvStorePersistente } from '@/src/almacenamiento/kvStore';
import { obtenerUsuarioId } from '@/src/almacenamiento/usuarioLocal';
import { quitarDispositivo } from '@/src/notificaciones/registroPush';
import { servicioAuth } from '@/src/servicios/auth';
import { AlmacenSesion, type InstantaneaSesion } from './almacenSesion';
import { biometriaDelTelefono } from './biometria';
import { tokenStoreSeguro } from './tokenStore';

export type { EstadoSesion, InstantaneaSesion, ResultadoAccion } from './almacenSesion';

/** Instancia que usa la app (las dependencias reales). */
export const sesion = new AlmacenSesion({
  auth: servicioAuth,
  tokens: tokenStoreSeguro,
  kv: kvStorePersistente,
  biometria: biometriaDelTelefono,
  antesDeCerrarSesion: () => quitarDispositivo(),
});

export function useSesion(): InstantaneaSesion {
  return useSyncExternalStore(sesion.suscribir, sesion.obtener, sesion.obtener);
}

/** El id de la cuenta si hay sesión activa; si no, el id local del teléfono. */
export async function usuarioIdActual(): Promise<string> {
  const { estado, usuario } = sesion.obtener();
  if (estado === 'activa' && usuario) return usuario.id;
  return obtenerUsuarioId();
}
