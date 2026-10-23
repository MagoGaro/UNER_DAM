import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { TareasDeFondo } from '@/src/componentes/TareasDeFondo';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <TareasDeFondo />
      <Stack screenOptions={{ headerBackTitle: 'Atrás', headerTitleStyle: { fontWeight: '800' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="evento/[id]" options={{ title: 'Evento' }} />
        <Stack.Screen name="visita/[id]" options={{ title: 'Visita' }} />
        <Stack.Screen name="registrar/qr" options={{ title: 'Escanear QR' }} />
        <Stack.Screen name="registrar/elegir" options={{ title: 'Elegir lugar' }} />
        <Stack.Screen name="registrar/confirmar" options={{ title: 'Registrar visita' }} />
        <Stack.Screen name="registrar/camara" options={{ title: 'Foto', presentation: 'fullScreenModal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
