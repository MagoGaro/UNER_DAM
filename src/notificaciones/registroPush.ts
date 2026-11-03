import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { kvStorePersistente, type KVStore } from '@/src/almacenamiento/kvStore';
import { servicioDispositivos as servicioPorDefecto, type ServicioDispositivos } from '@/src/servicios/dispositivos';
import { esError } from '@/src/tipos/api';
import { pedirPermisoNotificaciones } from './configuracion';

const CLAVE_TOKEN = 'push.tokenExpo';

/**
 * Registra este teléfono en la API para recibir push (por ejemplo, un
 * evento guardado que se suspende). Solo funciona en una build propia: en
 * Expo Go las push remotas no existen, en web tampoco, y sin el id de
 * proyecto de EAS (`eas init`) no se puede pedir el token. En todos esos
 * casos no hace nada y la app sigue con sus avisos locales.
 */
export async function registrarDispositivo(
  servicio: ServicioDispositivos = servicioPorDefecto,
  kv: KVStore = kvStorePersistente
): Promise<void> {
  if (Platform.OS === 'web' || isRunningInExpoGo()) return;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return;
  if (!(await pedirPermisoNotificaciones())) return;

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  const respuesta = await servicio.registrar(token.data, Platform.OS === 'ios' ? 'ios' : 'android');
  if (!esError(respuesta)) await kv.guardar(CLAVE_TOKEN, token.data);
}

/** Da de baja este teléfono (al cerrar sesión). Va antes de borrar el token de sesión. */
export async function quitarDispositivo(
  servicio: ServicioDispositivos = servicioPorDefecto,
  kv: KVStore = kvStorePersistente
): Promise<void> {
  const token = await kv.obtener(CLAVE_TOKEN);
  if (!token) return;
  await servicio.quitar(token);
  await kv.borrar?.(CLAVE_TOKEN);
}
