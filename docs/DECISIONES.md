# Decisiones de la primera versión

Criterios tomados para cerrar los puntos que el pedido de Valeria dejaba
abiertos. Se adoptaron de común acuerdo en el equipo; si Valeria responde
distinto, cada uno indica el único lugar que hay que tocar.

| Tema | Decisión | Dónde cambiarlo |
| --- | --- | --- |
| **Horarios de termas (verano/invierno)** | `Horario` suma `temporada` opcional. El detalle muestra el horario de cada temporada y «abierto ahora» usa el de la temporada vigente. | `src/tipos/lugar.ts`, `src/utils/horarios.ts` |
| **Categorías** | Se mantienen las 7 del pedido más `monumento`, `mirador`, `restaurante` y `otro`. El id del catálogo (`cat-museos`) se traduce a la clave interna. | `src/tipos/categoria.ts` |
| **Baños** | Se cargan como lugares comunes (categoría `otro`) hasta que Valeria defina una categoría de servicios. No requiere código nuevo. | Planilla de lugares |
| **Cuenta y login** | Sin cuenta por defecto (mapa, lugares y agenda abiertos). Cuenta con email y contraseña, token en `expo-secure-store`, reingreso opcional con huella o rostro. Hoy contra un mock (`lucia@mail.com` / `123456`). | `src/servicios/auth/index.ts` |
| **Favoritos** | Se guardan primero en el teléfono; con cuenta se suben al servidor con cola para cuando no hay señal. Los del invitado pasan a la cuenta al ingresar y se borran al cerrar sesión. | `src/servicios/favoritos/index.ts` |
| **Aviso de evento cancelado o suspendido** | La app detecta el cambio al abrirse, al volver a primer plano y al recuperar señal, y avisa con una notificación local a quien lo guardó. No hay notificaciones push desde un servidor en esta versión (requieren un servicio aparte). | `src/agenda/` |
| **Foto de la visita** | Queda local (`fotoUri`) y viaja con la visita en la cola de sincronización. El endpoint de subida lo define la API de la cátedra. | `src/servicios/visitas/` |
| **Flecha de orientación** | `watchHeadingAsync` (norte verdadero, con calibración) y, si no está disponible, el magnetómetro de `expo-sensors` como respaldo. | `src/hooks/useRumboDispositivo.ts`, `src/utils/brujula.ts` |
| **Sin señal** | Catálogo guardado en el teléfono (se ve aunque falle la red), agenda y favoritos persistidos, visitas en cola, audioguías descargables (una por una o todas desde «Yo»). El mapa base no tiene mosaicos offline: dentro de El Palmar se ven los marcadores y funcionan «Cerca tuyo» y la flecha, pero no las calles. | `src/servicios/lugares/servicioLugaresConCache.ts` |
| **Audioguías** | Suenan con la pantalla apagada y con controles en la pantalla de bloqueo; adelantar/retroceder 15 s y tiempo que falta. El Molino Forclaz viaja dentro de la app. | `src/audio/` |
| **Tema claro/oscuro** | No hay selector en esta versión: la app sigue al sistema. `Preferencias.tema` ya se guarda para sumarlo después. | `src/pantallas/YoPantalla.tsx` |
| **Íconos** | Se mantiene `@expo/vector-icons` (mismo set Ionicons, funciona en Expo Go y en las builds de EAS). Pasar a `@react-native-vector-icons/ionicons`, como menciona el pedido, es reemplazar los imports en 25 archivos (buscar y reemplazar), pero hay que probarlo en un celular real para confirmar que las fuentes cargan. | Todos los `import ... '@expo/vector-icons'` |
| **«Lejos»** | A partir de 300 m se muestra la flecha. | `UMBRAL_LEJOS_METROS` |
| **Identificador de la app** | `com.grupo44.miciudadcolon` (iOS y Android), provisorio hasta definirlo con la cátedra. | `app.json` |

## Antes de entregar

- [ ] Probar en un Android y un iPhone: ubicación, cámara/QR, notificaciones, huella o rostro, audioguía con la pantalla apagada.
- [ ] Probar sin señal (modo avión): lugares, agenda, favoritos, visita con foto y audioguía descargada.
- [ ] Probar con la letra del teléfono agrandada y negando cada permiso.
- [ ] `eas init` con la cuenta de Expo del grupo y luego `eas build --profile preview`.
- [ ] Reemplazar los servicios de prueba (`src/servicios/*/index.ts`) por los de la API cuando la cátedra la publique.

## Avisos esperados en Expo Go

- **«expo-notifications: Android Push notifications … was removed from Expo Go»**: aparece solo en desarrollo dentro de Expo Go. La app usa únicamente notificaciones locales, que funcionan igual, y en una build de EAS no existe. Se silencia en `src/utils/silenciarAvisoExpoGo.ts`, que se importa primero desde `index.ts` (el archivo de entrada, referido en `package.json`).

## Conexión con la API de Mi Ciudad

La API de la cátedra (carpeta `api-mi-ciudad` de `franco-ruisdias-uner/api-proyectos-mobile`) ya está conectada. Los servicios reales viven en `src/servicios/*/servicio*Api.ts` y se eligen en el `index.ts` de cada servicio.

| Tema | Decisión |
| --- | --- |
| **Base de datos de la API** | SQLite por defecto (sin instalar nada). También PostgreSQL 17, MySQL 8.4 y MariaDB 11 (`DB_MOTOR` en el `.env` de la API). Publicada en la nube usa PostgreSQL en Supabase, con la API en Render. La app no habla con la base: solo con la API. |
| **Cuándo usa la API real** | Si existe `EXPO_PUBLIC_API_URL` (en `.env.local`, ver `.env.example`). Sin esa variable la app sigue con datos de prueba, así nadie queda trabado sin la API levantada. Hay que reiniciar con `npx expo start -c` al cambiarla. |
| **Cuentas de demo de la API** | `lucia@mail.com` / `lucia1234`, `nuevo@demo.ar` / `nuevo1234` (cuenta vacía) y `turismo@colon.demo.ar` / `turismo1234` (puede suspender eventos). La de prueba sin API sigue siendo `lucia@mail.com` / `123456`. |
| **Catálogo** | Se baja entero (`GET /lugares?porPagina=500`) y se guarda en el teléfono con `ServicioLugaresConCache`. Pendiente de mejora: pedir solo las novedades con `actualizadoDesde`. |
| **Favoritos** | La API los maneja por lugar (`PUT` y `DELETE /yo/favoritos/:lugarId`), por eso `ServicioFavoritos.quitar` recibe `usuarioId` y `lugarId`. Si un lugar ya no existe en el servidor, el favorito pendiente se descarta. |
| **Mi recorrido** | Para subir una visita con foto, primero `POST /archivos` (multipart) y después `POST /yo/visitas` con la URL devuelta. Las visitas piden sesión: sin cuenta esperan en la cola del teléfono hasta que la persona ingrese. La API acepta fotos JPG, PNG o WEBP de hasta 5 MB (una foto HEIC se rechaza y queda pendiente). |
| **Lo que la API no tiene** | Cerrar sesión (se olvida el token en el teléfono; dura 30 días) y borrar visitas (se borran del teléfono y quedan en la cuenta). |
| **Eventos guardados y avisos** | La app sigue detectando los cambios de estado al abrirse, al volver a primer plano y al recuperar señal, y avisa con notificaciones locales. Las push desde el servidor (`/dispositivos`, `/yo/eventos-guardados`) no se usan: en la API quedan para que las completen los alumnos y las push remotas no andan en Expo Go. |
| **Categorías** | La API trae también `cat-bodegas` (sin lugares), que la app todavía no muestra como filtro propio. |
| **Builds de EAS** | Una app instalada no llega a `http://` ni a una IP de la compu: para eso hay que publicar la API (Render + Supabase, ver el README de la API) y usar su dirección `https://`. |

Para probar contra la API real: levantarla (README de la API, `docker compose up` o `pnpm dev`), copiar `.env.example` a `.env.local` con la IP de la compu, `npx expo start -c` y, si se quiere, `API_PRUEBAS_URL=http://localhost:3000 npx jest src/servicios/api/integracion` (prueba el cliente contra la API sin abrir la app).
