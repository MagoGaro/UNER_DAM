
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Evento } from '@/src/tipos/evento';
import { desdeISO, formatearHora } from '@/src/utils/fechas';
import { CANAL_AVISOS, pedirPermisoNotificaciones } from './configuracion';


/**
 * Recordatorios locales de eventos guardados (expo-notifications). Todo
 * es best-effort: si no hay permiso o estamos en web, devuelven null /
 * false y la agenda sigue funcionando (el evento queda guardado igual).
 */
export interface ServicioRecordatorios {
  programar(evento: Evento, cuando: Date): Promise<string | null>;
  cancelar(notificacionId: string | null): Promise<void>;
  avisarAhora(titulo: string, cuerpo: string, eventoId: string): Promise<void>;
}

export const servicioRecordatoriosExpo: ServicioRecordatorios = {
  async programar(evento, cuando) {
    if (Platform.OS === 'web') return null;
    if (!(await pedirPermisoNotificaciones())) return null;

    try {
      const inicio = desdeISO(evento.inicio);
      return await Notifications.scheduleNotificationAsync({
        content: {
          title: `Empieza a las ${inicio ? formatearHora(inicio) : 'pronto'}: ${evento.titulo}`,
          body: evento.direccionLibre ?? 'Tocá para ver el detalle y cómo llegar.',
          data: { tipo: 'evento', eventoId: evento.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: cuando,
          ...(Platform.OS === 'android' ? { channelId: CANAL_AVISOS } : {}),
        },
      });
    } catch {
      // Best-effort: en caso de error en Expo Go no interrumpe el guardado en la agenda
      return null;
    }
  },

  async cancelar(notificacionId) {
    if (!notificacionId || Platform.OS === 'web') return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificacionId);
    } catch {
      // ya no existía
    }
  },

  async avisarAhora(titulo, cuerpo, eventoId) {
    if (Platform.OS === 'web') return;
    if (!(await pedirPermisoNotificaciones())) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: { title: titulo, body: cuerpo, data: { tipo: 'evento', eventoId } },
        trigger: Platform.OS === 'android' ? { channelId: CANAL_AVISOS } : null,
      });
    } catch {
      // sin permiso / sin módulo
    }
  },
};