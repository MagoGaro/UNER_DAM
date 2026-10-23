# Revisión del código — rama `integrante1-lugares` (22/10/2026)

Se revisó todo lo hecho hasta el commit `36cf99d` («corregir filtrado por
categorías y actualizar catálogo de prueba») contra el pedido de Valeria
(«Mi Ciudad — Pedido de aplicación móvil»).

## Resultado de las verificaciones

| Chequeo | Antes | Después |
| --- | --- | --- |
| `npx tsc --noEmit` | ❌ 1 error | ✅ sin errores |
| `npm run lint` | ❌ 1 error (`jest.setup.js`) | ✅ sin errores |
| `npm run test` | ✅ 11 tests | ✅ 59 tests |
| Bundle Android / iOS / web (`expo export`) | ⚠️ Android fallaba con una instalación limpia (ver punto 6) | ✅ los tres compilan |

## Errores encontrados y corregidos

1. **Los avisos de proximidad no funcionaban.** `useAvisosProximidad`
   importaba `servicioAvisosProximidadExpo` (una instancia) pero el
   archivo solo exportaba la clase → `undefined` en tiempo de ejecución
   (y el error de `tsc`). Además la clase solo hacía `console.log`.
   Ahora manda una **notificación local real** (`expo-notifications`) y
   vibra (`expo-haptics`). Las notificaciones *locales* sí funcionan en
   Expo Go; lo que se quitó en SDK 53 son las *push* remotas.
2. **Horarios: las Termas figuraban siempre "Cerrado".** En
   `src/utils/horarios.ts` se comparaba `'verano'` (en minúsculas) contra
   `'Verano'`, así que ningún horario por temporada coincidía. Justo lo
   que pidió Valeria: *«No quiero volver a mandar gente a una puerta
   cerrada»*. Corregido, más otros dos casos:
   - **Cierres después de medianoche** (Don Hugo cierra 00:30 / 01:00):
     antes nunca figuraba abierto a la noche.
   - **Dos franjas el mismo día** (almuerzo y cena): antes solo se miraba
     la primera.
   Con 8 tests nuevos en `horarios.test.ts`.
3. **Categorías: el Molino Forclaz y las playas salían como «Otro».**
   `obtenerMetadatoCategoria('cat-museos')` buscaba `museos` pero la
   clave es `museo` (igual con `cat-playas`). Además
   `TarjetaLugarCercano` y `MarcadorLugar` leían `lugar.categoria`, que
   los mocks no cargan: todas las tarjetas decían «Lugar» y todos los
   pines eran naranjas. Corregido, con test que verifica que ningún lugar
   del catálogo cae en «Otro» por error.
4. **Almacenamiento:** se usaba AsyncStorage, pero el documento técnico
   pide `expo-sqlite/kv-store`. `src/almacenamiento/kvStore.ts` ahora usa
   kv-store (misma interfaz, nadie más tuvo que cambiar) y en web usa
   `localStorage` (`kvStore.web.ts`). Se quitó la dependencia de
   AsyncStorage.
5. **Lint:** `jest.setup.js` usaba `jest` sin declararlo.
6. **Dependencias:** con una instalación limpia, `expo-audio` arrastraba
   `expo-asset@58` (de otro SDK) y el bundle de Android fallaba con
   *«Unable to resolve module expo/internal/bundle-origin»*. Se fijó
   `expo-asset ~12.0.14` (la de SDK 54). Se regeneró `package-lock.json`;
   después de bajar la rama corran `npm install`.

## Cosas que funcionan bien

- Separación en capas (tipos / servicios / hooks / componentes), servicios
  asíncronos y detrás de interfaces: se pudo sumar Agenda y Mi recorrido
  sin tocar la lógica del mapa.
- Manejo de permiso de ubicación denegado (la app sigue, ordena por
  nombre), brújula no disponible (la flecha se oculta), un aviso por lugar
  por día, variante web del mapa.
- Mocks con casos feos (sin teléfono, gratis, lugar lejano).

## Para decidir en equipo (no se cambió)

- **Íconos:** el documento dice usar `@react-native-vector-icons/ionicons`
  y no `@expo/vector-icons`. Todo el proyecto usa `@expo/vector-icons` (y
  `MaterialIcons` en el detalle). Cambiarlo toca todos los archivos y hay
  que verificar que las fuentes carguen en Expo Go: conviene decidirlo
  juntos. Las pantallas nuevas usan Ionicons igual que el resto, así el
  cambio es un buscar y reemplazar.
- **Tipos fuera del documento:** `Lugar` tiene `categoria`, `imagenUrl`,
  `calificacion` extra; `Horario` tiene `temporada` (que el documento no
  tiene, pero es necesaria para las termas: **preguntarle a Valeria**
  cómo va a venir eso en la API). Falta la interfaz `Categoria` del
  documento (`id`, `nombre`, `icono`, `color`, `orden`).
- **Categorías:** el documento pide playas, termas, museos y patrimonio,
  gastronomía, artesanías, naturaleza y alojamiento. El código suma
  monumentos, miradores, restaurante y otro.
- **Forma de la respuesta de la API:** `ServicioLugares` devuelve arrays
  sueltos; el documento dice que la API siempre responde
  `{ datos, meta }` o `{ error }`. Los servicios nuevos (eventos,
  visitas) ya usan esa forma (`src/tipos/api.ts`); convendría alinear el
  de lugares.
- **Catálogo sin señal:** los lugares no se guardan en el teléfono; si se
  abre la app sin señal, el mapa y «Cerca tuyo» quedan vacíos. La Agenda
  y Mi recorrido ya funcionan offline; el mismo patrón (`kvStore` +
  `leerJSON`) sirve para el catálogo.
- **Audioguía con pantalla apagada:** falta `shouldPlayInBackground` y el
  modo `audio` de iOS (punto 6, no es de esta parte).
- **Imágenes de prueba:** varias son links directos a TripAdvisor /
  Google que pueden dejar de andar.
- `useLugares` recibe `filtros` pero no se los pasa al servicio.

## Preguntas para Valeria (salieron al armar los puntos 3 y 4)

1. ¿Formato del QR? Proponemos el texto `COLON:lug-004` (ya está en el
   catálogo como `codigoQr`).
2. ¿A cuántos metros cuenta como «estuve acá»? Usamos 150 m.
3. ¿Cuánto antes avisamos de un evento guardado? Usamos 1 hora.
4. Para que quien guardó un evento se entere **con la app cerrada** de que
   se suspendió, hace falta que la API mande notificaciones *push*. Hoy la
   app se entera al abrirla. ¿La API de la cátedra va a tener push?
5. Las visitas hoy se guardan a nombre de un id del teléfono hasta que
   exista la cuenta (Integrante 3). ¿Al iniciar sesión se pasan a la
   cuenta?
