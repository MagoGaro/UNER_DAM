import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Lugar } from '@/src/tipos/lugar';
import type { ServicioAvisosProximidad } from './ServicioAvisosProximidad';

const CANAL_ANDROID = 'avisos-proximidad';

// Mientras la app está abierta, mostrar el aviso igual (banner + sonido).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function asegurarCanalAndroid(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
    name: 'Avisos de proximidad',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
}

/** Implementación real: notificación local + vibración al llegar a un lugar. */
export const servicioAvisosProximidadExpo: ServicioAvisosProximidad = {
  async pedirPermiso() {
    await asegurarCanalAndroid();
    const permisoActual = await Notifications.getPermissionsAsync();
    if (permisoActual.granted) return true;

    const solicitado = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
    return solicitado.granted;
  },

  async avisarLlegada(lugar: Lugar) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Llegaste a ${lugar.nombre}`,
        body: 'Tocá para ver más sobre este lugar.',
        data: { lugarId: lugar.id },
      },
      trigger: Platform.OS === 'android' ? { channelId: CANAL_ANDROID } : null,
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
};
