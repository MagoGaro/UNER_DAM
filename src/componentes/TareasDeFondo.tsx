import * as Network from 'expo-network';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { agenda } from '@/src/agenda/almacenAgenda';
import { favoritos, iniciarCuenta } from '@/src/favoritos';
import { estaConectado } from '@/src/hooks/useConexion';
import { configurarNotificaciones } from '@/src/notificaciones/configuracion';
import { rutaDetalleEvento, rutaDetalleLugar } from '@/src/navegacion/rutas';
import { recorrido } from '@/src/recorrido';

/**
 * Se monta una sola vez en app/_layout.tsx y no dibuja nada:
 * - configura las notificaciones locales y arranca la cuenta (sesión y favoritos);
 * - al abrir la app y al volver a primer plano, actualiza la agenda
 *   (así se detecta si un evento guardado se suspendió) y sube la cola
 *   de visitas pendientes;
 * - cuando vuelve la señal, sube las visitas guardadas sin conexión;
 * - al tocar una notificación, abre el evento o el lugar.
 */
export function TareasDeFondo() {
  useEffect(() => {
    configurarNotificaciones();
    const bajaCuenta = iniciarCuenta();

    const refrescar = () => {
      agenda.cargarEventos().catch(() => {});
      favoritos.sincronizar().catch(() => {});
      recorrido
        .recargar()
        .then(() => recorrido.sincronizar())
        .catch(() => {});
    };
    refrescar();

    const subApp = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') refrescar();
    });

    let estabaConectado = true;
    const subRed = Network.addNetworkStateListener((s) => {
      const ahora = estaConectado(s);
      if (ahora && !estabaConectado) refrescar();
      estabaConectado = ahora;
    });

    let subNotif: { remove(): void } | null = null;
    if (Platform.OS !== 'web') {
      try {
        subNotif = Notifications.addNotificationResponseReceivedListener((respuesta) => {
          const datos = respuesta.notification.request.content.data as { eventoId?: unknown; lugarId?: unknown } | undefined;
          if (typeof datos?.eventoId === 'string') router.push(rutaDetalleEvento(datos.eventoId));
          else if (typeof datos?.lugarId === 'string') router.push(rutaDetalleLugar(datos.lugarId));
        });
      } catch {
        subNotif = null;
      }
    }

    return () => {
      bajaCuenta();
      subApp.remove();
      subRed.remove();
      subNotif?.remove();
    };
  }, []);

  return null;
}
