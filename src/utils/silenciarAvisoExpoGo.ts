import { LogBox } from 'react-native';

/**
 * Dentro de Expo Go (solo en desarrollo) `expo-notifications` muestra un
 * error rojo diciendo que las notificaciones push remotas ya no existen
 * ahí. La app solo usa notificaciones locales (avisos de cercanía y
 * recordatorios de eventos), que funcionan igual, y en una build real
 * este aviso no existe. Se silencia para que no tape la pantalla.
 *
 * Tiene que ejecutarse antes de que se cargue cualquier pantalla: por eso
 * se importa primero en `index.ts`, el archivo de entrada de la app.
 */
if (__DEV__) {
  LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);
}
