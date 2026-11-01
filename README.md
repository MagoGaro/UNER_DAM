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
  `ServicioLugaresDePrueba` (mock con lugares reales de Colón, Entre
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
  (Mapa / Agenda / Mi recorrido / Yo).

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
  termas, a confirmar igual con el equipo, siguen siendo provisorias.
- `Lugar` suma `imagenUrl`/`calificacion`, opcionales, solo para que la
  tarjeta de «Cerca tuyo» tenga contenido.
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
- Mapa base sin mosaicos offline (dentro de El Palmar, por ejemplo): sin
  resolver, ver pregunta 3 del seguimiento.
- A partir de cuántos metros se considera «lejos» un lugar: hoy es
  `UMBRAL_LEJOS_METROS` en `src/configuracion/preferenciasPorDefecto.ts`.

## 📅 Agenda de eventos (punto 3 del pedido)

Pestaña **Agenda** (`app/(tabs)/agenda.tsx` → `src/pantallas/AgendaPantalla.tsx`)
y detalle en `app/evento/[id].tsx` → `src/pantallas/DetalleEventoPantalla.tsx`.

| Pedido de Valeria | Cómo quedó |
| --- | --- |
| Ver los eventos por día, empezando por hoy | Tira de días (Hoy, Mañana, sáb 24…) de 14 días; un punto marca los días con eventos. Si un día está vacío, botón «Ver mañana / el próximo día con eventos». |
| Detalle: qué es, cuándo empieza, cuánto dura, dónde, si es gratis | Cuándo, hora de inicio y fin, duración calculada («5 h», «1 h 30 min»), dónde, entrada («Gratis» / «$ 1.500» / «Precio no informado»). |
| Asociado a un lugar del catálogo o con dirección suelta | Con `lugarId` muestra el nombre del lugar y lleva a su detalle; con `direccionLibre` la muestra y «Cómo llegar» usa las coordenadas o, si no hay, busca la dirección en la app de mapas. Un `lugarId` que ya no existe no rompe nada. |
| Guardar un evento y que avise antes | «Guardar y avisarme»: notificación local **60 min antes** (o 10 min antes si falta menos). Pestaña «Guardados». |
| Cancelado / suspendido por lluvia, y que quien lo guardó se entere | Chip y franja roja en lista y detalle. Al abrir la app, al volver a primer plano y al entrar a la Agenda se compara con lo que se sabía: si un evento guardado se suspende, cancela o cambia de horario, se **cancela el recordatorio** y llega una notificación («Evento suspendido…»). También avisa si vuelve a programarse. |
| Funciona sin señal | La última agenda y los guardados quedan en el teléfono (`expo-sqlite/kv-store`); sin conexión se muestra esa copia con un aviso. |

Código: `src/agenda/logicaAgenda.ts` (lógica pura, con tests),
`src/agenda/almacenAgenda.ts` (estado compartido, caché, guardados),
`src/notificaciones/recordatoriosEventos.ts`, `src/servicios/eventos/`
(interfaz + mock con la forma `{ datos, meta }` / `{ error }` de la API) y
`src/mocks/eventos.ts` (fechas relativas a hoy, con los casos feos:
suspendido, cancelado, finalizado, sin imagen, sin fin, sin precio,
dirección sin coordenadas, lugar inexistente y un texto larguísimo).

## 📸 Mi recorrido (punto 4 del pedido)

Pestaña **Mi recorrido** (`src/pantallas/MiRecorridoPantalla.tsx`) y
pantallas en `app/registrar/` y `app/visita/[id].tsx`.

| Pedido de Valeria | Cómo quedó |
| --- | --- |
| Registrar que estuvo en un lugar escaneando el QR | «Escanear QR» (`expo-camera`, `CameraView`). Linterna para la noche. |
| … estando físicamente cerca | «Estoy acá»: GPS de una sola vez (con tope de 15 s); lista los lugares a menos de **150 m**. Si la precisión es peor que ±100 m o no hay señal, lo dice y ofrece elegir a mano. |
| … o cargándolo a mano | «Elegir lugar» con buscador, ordenado por cercanía si ya hay ubicación. También desde el detalle de cualquier lugar: botón «Registrar visita». Si elegís a mano pero estás al lado, queda registrado como GPS. |
| Sacar una foto en el lugar asociada a la visita | Cámara propia o galería (`expo-image-picker`). La foto se copia a la carpeta permanente de la app (`expo-file-system`, API nueva `File`/`Directory`/`Paths`). |
| Escribir una nota corta | Hasta 280 caracteres, con contador. Se puede editar después. |
| Ver el recorrido completo, en orden, con las fotos | Línea de tiempo numerada, agrupada por día (Hoy, Ayer, …), con foto y nota. Resumen «N lugares · N fotos». |
| QR que no es nuestro o roto: no romperse ni quedar colgada | `src/recorrido/codigoQr.ts`: un QR ajeno (menú de un bar, Wi-Fi, link) o roto muestra un aviso y la cámara sigue leyendo. A los 15 s aparece «¿No lee? Elegir a mano». Con tests. |
| La visita se guarda sin señal (`sincronizada: false`) | Todo se guarda primero en **SQLite** (`expo-sqlite`, tabla `visitas` igual al tipo `Visita`) y una cola (`src/recorrido/sincronizador.ts`) la sube cuando vuelve la conexión (`expo-network`), al abrir la app o al volver a primer plano. Si la red se cae a mitad de camino, lo que no subió queda pendiente. La tarjeta muestra «Sin subir». |
| Vibración al registrar | `expo-haptics`. |

Formato de QR **propuesto** (a confirmar con Valeria): el texto
`COLON:<id del lugar>`, que es el campo `codigoQr` del catálogo
(ej. `COLON:lug-004`). También acepta una URL que termine en ese texto o
con `?qr=COLON:lug-004`, por si prefieren que el QR abra una web.

## 👤 Cuenta, favoritos y audioguías (puntos 5 y 6 del pedido)

Todo vive bajo `src/`, con la misma regla de siempre: las pantallas dependen de interfaces y el único archivo que cambia al llegar la API es el `index.ts` de cada servicio.

- `src/sesion/` — estado de la cuenta (`AlmacenSesion`): invitado, bloqueada (espera huella o rostro) y activa. Token en `expo-secure-store` (`tokenStore.ts`), biometría en `biometria.ts`, validaciones de los formularios.
- `src/favoritos/` — favoritos locales con cola de sincronización y `iniciarCuenta()`, que arranca todo desde `TareasDeFondo`.
- `src/servicios/auth/`, `src/servicios/favoritos/` — interfaz + mock. Para probar: `lucia@mail.com` / `123456`; un email con «sinred» simula que no hay conexión.
- `src/servicios/lugares/servicioLugaresConCache.ts` — guarda el catálogo para verlo sin señal.
- `src/audio/` — descarga de audioguías a `expo-file-system` (`audioguias.ts`) y su hook (`useAudioguiaOffline.ts`). El reproductor está en `app/lugar/[id].tsx`.
- `src/pantallas/YoPantalla.tsx` — pestaña «Yo»: cuenta, favoritos, avisos de cercanía y «guardar audioguías para usar sin señal».
- `src/componentes/favoritos/BotonFavorito.tsx` — el corazón del detalle del lugar.

Las decisiones tomadas para cerrar los puntos abiertos del pedido están en [`docs/DECISIONES.md`](docs/DECISIONES.md).

### Generar una build con EAS

```bash
npm install -g eas-cli
eas login
eas init                              # crea el proyecto en la cuenta de Expo y completa app.json
eas build --profile preview --platform android   # APK para probar
eas build --profile production                    # build de entrega
```

`eas.json` ya trae los perfiles `preview` y `production`. Para iPhone hace falta una cuenta de Apple Developer (ver la nota de Expo Go más abajo).

## Revisión del código existente

Antes de sumar los puntos 3 y 4 se revisó lo que ya estaba. El detalle de
lo encontrado, lo corregido y lo que queda para decidir en equipo está en
[`docs/REVISION.md`](docs/REVISION.md).

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
  no sea el mapa (ver limitación de `react-native-maps` más arriba). En
  web, la Agenda y Mi recorrido funcionan (las visitas se guardan en el
  navegador); los avisos y la cámara se prueban en el celular.

### Tests

```bash
npm run test        # 59 tests
npx tsc --noEmit    # tipos
npm run lint
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
