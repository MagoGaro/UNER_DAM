# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Mapa, «Cerca tuyo», flecha y avisos de proximidad

Parte del Integrante 2 (mapa, lista «Cerca tuyo», «Cómo llegar», flecha de
orientación y avisos de proximidad). Vive toda bajo `src/`, separada por
capas:

- `src/tipos/` — `Lugar`, `Categoria`, `Coordenadas`, `Preferencias`
  (provisorios: pendiente de acuerdo con el equipo, ver más abajo).
- `src/utils/geo.ts` — cálculo puro: `distanciaMetros`, `rumboGrados`,
  `formatearDistancia` (+ `yaAviseHoy`/`marcarAviso`, reexportados desde
  `src/almacenamiento/`). Con tests en `geo.test.ts`.
- `src/servicios/lugares/` — `ServicioLugares` (interfaz) +
  `ServicioLugaresDePrueba` (mock con 8 lugares reales de Colón, Entre
  Ríos). **Único lugar que hay que tocar** para conectar el servicio real.
- `src/hooks/` — `usePosicionUsuario`, `useRumboDispositivo`,
  `useLugaresCercanos`, `useAvisosProximidad`: cada uno con una sola
  responsabilidad, todos con manejo explícito de permiso denegado / error
  / sensor no disponible.
- `src/componentes/mapa/` — `MapaLugares` (+ variante `.web.tsx`, ver
  abajo), `MarcadorLugar`, `MarcadorUsuario` (burbuja «Vos estás acá»),
  `FiltroCategoria`, `BarraBusqueda`.
- `src/componentes/cerca-tuyo/` — `HojaCercaTuyo` (hoja inferior
  arrastrable, con `Animated` + `PanResponder` nativos de React Native,
  sin sumar una librería nueva), `ListaCercaTuyo`, `TarjetaLugarCercano`.
- `src/componentes/orientacion/FlechaOrientacion.tsx`,
  `src/componentes/estados/` (`EstadoVacio`, `PantallaPendiente` para las
  secciones de la barra de tabs que todavía no desarrolló su responsable).
- `src/notificaciones/` y `src/navegacion/` — avisos de proximidad
  (expo-notifications + expo-haptics) y «Cómo llegar» (Linking a Google/
  Apple Maps), cada uno detrás de su propia interfaz.
- `src/pantallas/InicioPantalla.tsx` — arma todo lo anterior: mapa a toda
  pantalla, header + buscador + chips flotando arriba, hoja «Cerca tuyo»
  flotando abajo. Se monta desde
  [`app/(tabs)/index.tsx`](app/(tabs)/index.tsx). La barra de tabs
  (`app/(tabs)/_layout.tsx`) tiene las 4 secciones de la app completa
  (Mapa / Agenda / Mi recorrido / Yo); las últimas tres son placeholders
  hasta que sus responsables entreguen su parte.

### Decisiones tomadas (por si Valeria responde distinto)

- La flecha usa `expo-location.watchHeadingAsync` (no
  `expo-sensors.Magnetometer` crudo): ya combina el magnetómetro con la
  corrección de norte verdadero y expone el nivel de calibración.
- `react-native-maps` en vez del nuevo `expo-maps`: `expo-maps` está en
  alpha, no soporta Expo Go y no tiene componente único para ambas
  plataformas.
- `react-native-maps` no soporta web. `MapaLugares.web.tsx` muestra un
  aviso en vez de romper `npm run web`; la hoja «Cerca tuyo» sí funciona
  en web (es la única forma de ver los lugares ahí).
- Categorías ajustadas a lo que necesita Colón como ciudad de río y
  termas (`playa`, `termas`, `museo`, `monumento`, `mirador`,
  `restaurante`, `alojamiento`, `otro`) en vez del set inventado
  originalmente — a confirmar igual con el equipo, siguen siendo
  provisorias.
- `Lugar` suma `imagenUrl`/`calificacion`/`descripcionCorta`, opcionales,
  solo para que la tarjeta de «Cerca tuyo» tenga contenido; se
  reemplazan cuando el Integrante 1 entregue el catálogo real. Las
  imágenes de prueba son de `picsum.photos` (placeholders, no fotos
  reales de los lugares).
- Mapa y lista conviven en pantalla (hoja arrastrable con dos posiciones)
  en vez de alternar entre dos vistas, para calzar con el mockup de
  diseño del equipo.
- Radio "lejos" (para mostrar la flecha) y preferencias de aviso
  (`avisarProximidad`, `radioAvisoMetros`) están en
  `src/configuracion/preferenciasPorDefecto.ts`, con valores por defecto
  hasta que existan las Preferencias reales del Integrante 3.

### Pendiente con el equipo (ver el seguimiento en PDF)

- Tipos definitivos de `Lugar`/`Categoria`/`Preferencias` (hoy son
  provisorios, en `src/tipos/`).
- Reemplazar `ServicioLugaresDePrueba` por el servicio real (Integrante 1).
- Reemplazar `app/lugar/[id].tsx` (placeholder) por la pantalla de detalle
  real (Integrante 1); `src/navegacion/rutas.ts` es el único archivo a
  tocar si cambia la ruta.
- Mapa base sin mosaicos offline (dentro de El Palmar, por ejemplo): sin
  resolver, ver pregunta 3 del seguimiento.
- A partir de cuántos metros se considera «lejos» un lugar: hoy es
  `UMBRAL_LEJOS_METROS` en `src/configuracion/preferenciasPorDefecto.ts`.

### Probar en un iPhone físico con Expo Go

La versión de Expo Go del **App Store** no siempre coincide con el SDK del
proyecto (54): Apple tarda en aprobar cada SDK nuevo, así que en algún
momento el store queda por delante y tira "incompatible con esta versión
de Expo Go". Si pasa:

- En **Android** (Play Store) suele estar más al día, es la forma más
  rápida de probar mientras tanto.
- La alternativa para iPhone es `npx eas-cli@latest go --sdk-version
  54.0.0` (arma una build a medida y la sube a TestFlight), pero necesita
  una cuenta de Apple Developer Program paga — no es algo para resolver
  al toque, hay que decidirlo en equipo cuando se organice el build de
  EAS de producción.
- Mientras tanto, `npm run web` sigue sirviendo para probar todo lo que
  no sea el mapa (ver limitación de `react-native-maps` más arriba).

### Tests

```bash
npm run test
```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
