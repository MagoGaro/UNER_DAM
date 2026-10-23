import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const CANAL_AVISOS = 'avisos';

let configurado = false;

/**
 * Se llama una sola vez desde app/_layout.tsx: define cómo se muestran
 * las notificaciones locales con la app abierta y crea el canal de
 * Android. En web no hay notificaciones locales programables, así que no
 * hace nada (y los servicios que notifican también se desactivan ahí).
 */
export function configurarNotificaciones(): void {
  if (configurado || Platform.OS === 'web') return;
  configurado = true;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync(CANAL_AVISOS, {
        name: 'Avisos de Mi Ciudad',
        importance: Notifications.AndroidImportance.DEFAULT,
      }).catch(() => {});
    }
  } catch {
    // Si el módulo no está disponible (Expo Go viejo, simulador), la app sigue sin avisos.
  }
}

/** Pide permiso de notificaciones una vez; nunca tira, devuelve false si no se puede. */
export async function pedirPermisoNotificaciones(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const actual = await Notifications.getPermissionsAsync();
    if (actual.granted) return true;
    if (!actual.canAskAgain) return false;
    const pedido = await Notifications.requestPermissionsAsync();
    return pedido.granted;
  } catch {
    return false;
  }
}
