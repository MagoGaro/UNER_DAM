// Archivo de entrada de la app. El orden importa: primero se configura el
// filtro de avisos y recién después arranca Expo Router, que carga todas
// las pantallas.
import './src/utils/silenciarAvisoExpoGo';
import 'expo-router/entry';
