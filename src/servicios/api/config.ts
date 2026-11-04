/**
 * Dirección de la API de Mi Ciudad. Se lee de `EXPO_PUBLIC_API_URL`
 * (archivo `.env.local`, ver `.env.example`). Sin esa variable `clienteApi`
 * responde error y las pantallas muestran el aviso de problema en el servidor.
 */
const crudo = (process.env.EXPO_PUBLIC_API_URL ?? '').trim();

export const URL_API: string | null = crudo ? crudo.replace(/\/+$/, '') : null;
export const usaApiReal: boolean = URL_API !== null;
