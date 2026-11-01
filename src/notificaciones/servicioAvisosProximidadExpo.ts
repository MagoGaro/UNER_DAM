import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Lugar } from '@/src/tipos/lugar';
import { CANAL_AVISOS, pedirPermisoNotificaciones } from './configuracion';
import type { ServicioAvisosProximidad } from './ServicioAvisosProximidad';

/**
 * Implementación real con expo-notifications (notificación local, que sí
 * funciona en Expo Go; lo que Expo Go dejó de soportar en SDK 53 son las
 * notificaciones *push* remotas) + vibración con expo-haptics.
 *
 * Antes este archivo solo hacía console.log y exportaba la clase, pero
 * useAvisosProximidad importaba una instancia que no existía: los avisos
 * no funcionaban (error de TypeScript en `tsc --noEmit`).
 */
export class ServicioAvisosProximidadExpo implements ServicioAvisosProximidad {
  async pedirPermiso(): Promise<boolean> {
    return pedirPermisoNotificaciones();
  }

  async avisarLlegada(lugar: Lugar): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Estás cerca de ${lugar.nombre}`,
          body: lugar.descripcionCorta,
          data: { tipo: 'proximidad', lugarId: lugar.id },
        },
        trigger: Platform.OS === 'android' ? { channelId: CANAL_AVISOS } : null,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Sin permisos o sin módulo nativo: no se avisa, pero la app sigue.
    }
  }
}

export const servicioAvisosProximidadExpo: ServicioAvisosProximidad = new ServicioAvisosProximidadExpo();
