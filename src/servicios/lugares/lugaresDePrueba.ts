import type { Lugar } from '@/src/tipos/lugar';

/**
 * Datos de prueba con coordenadas reales de Colón, Entre Ríos.
 * Saneado y corregido según las interfaces estrictas del pliego de Valeria Sosa.
 * Incluye casos de prueba complejos (valores nulos y un elemento lejano para el GPS).
 */
export const LUGARES_DE_PRUEBA: readonly Lugar[] = [
{
    id: 'lug-001',
    nombre: 'Termas Colón',
    categoriaId: 'cat-termas',
    descripcionCorta: 'Complejo termal a orillas del río Uruguay con piscinas cubiertas y al aire libre.',
    descripcion:
      'Un predio de 10 hectáreas arboladas con piletas de aguas mineralizadas a diferentes temperaturas, sector pasivo para relax y parque acuático recreativo con toboganes para toda la familia. Cuenta con 4 refugios totalmente cubiertos e ideales para mitigar el frío en invierno.',
    coordenadas: {
      latitud: -32.217277,
      longitud: -58.134543,
    },
    direccion: 'Batalla de Cepeda 100, Colón',
    imagenes: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/e9/14/69/termas-colon-sector-norte.jpg?w=1200&h=-1&s=1',
    ],
    horarios: [
      // VERANO (Dic - Mar): Abre de 09:00 a 21:00 hs de Lunes a Domingo
      { dia: 0, abre: '09:00', cierra: '21:00', temporada: 'Verano' },
      { dia: 1, abre: '09:00', cierra: '21:00', temporada: 'Verano' },
      { dia: 2, abre: '09:00', cierra: '21:00', temporada: 'Verano' },
      { dia: 3, abre: '09:00', cierra: '21:00', temporada: 'Verano' },
      { dia: 4, abre: '09:00', cierra: '21:00', temporada: 'Verano' },
      { dia: 5, abre: '09:00', cierra: '21:00', temporada: 'Verano' },
      { dia: 6, abre: '09:00', cierra: '21:00', temporada: 'Verano' },

      // INVIERNO (Abr - Nov): Abre de 09:00 a 20:00 hs de Lunes a Domingo
      { dia: 0, abre: '09:00', cierra: '20:00', temporada: 'Invierno' },
      { dia: 1, abre: '09:00', cierra: '20:00', temporada: 'Invierno' },
      { dia: 2, abre: '09:00', cierra: '20:00', temporada: 'Invierno' },
      { dia: 3, abre: '09:00', cierra: '20:00', temporada: 'Invierno' },
      { dia: 4, abre: '09:00', cierra: '20:00', temporada: 'Invierno' },
      { dia: 5, abre: '09:00', cierra: '20:00', temporada: 'Invierno' },
      { dia: 6, abre: '09:00', cierra: '20:00', temporada: 'Invierno' },
    ],
    telefono: '3447-434761',
    sitioWeb: 'https://termascolon.gov.ar',
    precioEntrada: 6000,
    audioguia: null,
    codigoQr: 'COLON:lug-001',
    accesible: true,
    activo: true,
    actualizadoEn: '2026-10-17T15:20:00-03:00',
  },
  
  {
    id: 'lug-002',
    nombre: 'Playa Nueva',
    categoriaId: 'cat-playas',
    descripcionCorta: 'Playa tranquila de arenas blancas sobre la ribera del río.',
    descripcion:
      'Una de las playas más elegidas por las familias locales por su baja profundidad y sombra natural de sauces y tipas. Es la continuación natural hacia el sur del Balneario Inkier. Cuenta con paradores y guardavidas durante la temporada estival.',
    coordenadas: {
      latitud: -32.2355,
      longitud: -58.1311,
    },
    direccion: 'Av. Costanera Sur y Paysandú, Colón',
    imagenes: [
      'https://media.todojujuy.com/p/ac192f0e5ca36008294cf1bda3b95f9c/adjuntos/227/imagenes/003/386/0003386969/1200x675/smart/colon-rios.png',
    ],
    horarios: [
      { dia: 1, abre: '08:00', cierra: '21:00' },
      { dia: 2, abre: '08:00', cierra: '21:00' },
      { dia: 3, abre: '08:00', cierra: '21:00' },
      { dia: 4, abre: '08:00', cierra: '21:00' },
      { dia: 5, abre: '08:00', cierra: '21:00' },
      { dia: 6, abre: '08:00', cierra: '21:00' },
      { dia: 0, abre: '08:00', cierra: '21:00' },
    ],
    telefono: null, // Caso feo obligatorio: Sin teléfono
    sitioWeb: 'https://colonturismo.tur.ar',
    precioEntrada: 0, // 0 significa Gratis según reglas del PDF
    audioguia: null,
    codigoQr: null,
    accesible: true,
    activo: true,
    actualizadoEn: '2026-10-17T15:20:00-03:00',
  },
  {
    id: 'lug-004',
    nombre: 'Molino Forclaz',
    categoriaId: 'cat-museos', // Alineado con el ID de la página 9
    descripcionCorta: 'Molino de viento histórico de 1888 levantado por colonos suizos.',
    descripcion:
      'Construido en 1888 por Juan Bautista Forclaz, este molino representa el esfuerzo y la epopeya de la inmigración en la región de Colonia San José. Monumento Histórico Nacional con visitas guiadas tradicionales y nocturnas teatralizadas.',
    coordenadas: {
      latitud: -32.1904,
      longitud: -58.1932,
    },
    direccion: 'Primeros Colonos s/n, Colonia San José',
    imagenes: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/a7/80/ec/caption.jpg?w=700&h=400&s=1',
    ],
    horarios: [
      { dia: 2, abre: '09:00', cierra: '18:00' }, // Lunes cerrado por mantenimiento (Ojo con los horarios!)
      { dia: 3, abre: '09:00', cierra: '18:00' },
      { dia: 4, abre: '09:00', cierra: '18:00' },
      { dia: 5, abre: '09:00', cierra: '18:00' },
      { dia: 6, abre: '10:00', cierra: '19:00' },
      { dia: 0, abre: '10:00', cierra: '19:00' },
    ],
    telefono: '3447-459001',
    sitioWeb: null, // Sin web propia
    precioEntrada: 1500,
    audioguia: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/22/Es-Molino_Forclaz-article.ogg/Es-Molino_Forclaz-article.ogg.mp3',
      duracionSegundos: 252,
      idioma: 'es',
    },
    codigoQr: 'COLON:lug-004',
    accesible: false, // Estructura de época no apta para sillas de ruedas
    activo: true,
    actualizadoEn: '2026-10-17T15:20:00-03:00',
  },
  {
    id: 'lug-007',
    nombre: 'Parque Nacional El Palmar',
    categoriaId: 'cat-naturaleza',
    descripcionCorta: 'Uno de los últimos palmares de yatay del país.',
    descripcion:
      'Reserva natural nacional que protege el ecosistema del espinal y los densos palmares de Yatay. Ideal para avistaje de fauna autóctona, senderismo y caminatas históricas hacia las ruinas de la calera del Barquín.',
    coordenadas: {
      latitud: -31.85306,
      longitud: -58.3225,
    },
    direccion: 'Ruta Nacional 14, Km 198, Ubajay',
    imagenes: [
      'https://www.planveta.com.ar/archivost/id_69/palmar1---copia.jpg',
    ],
    horarios: [
      { dia: 1, abre: '08:00', cierra: '19:00' },
      { dia: 2, abre: '08:00', cierra: '19:00' },
      { dia: 3, abre: '08:00', cierra: '19:00' },
      { dia: 4, abre: '08:00', cierra: '19:00' },
      { dia: 5, abre: '08:00', cierra: '19:00' },
      { dia: 6, abre: '08:00', cierra: '19:00' },
      { dia: 0, abre: '08:00', cierra: '19:00' },
    ],
    telefono: '3447-493031',
    sitioWeb: 'https://argentina.gob.ar',
    precioEntrada: 2500,
    audioguia: null,
    codigoQr: 'COLON:lug-007',
    accesible: true,
    activo: true, // Lugar lejano clave para simular la flecha de orientación sin señal
    actualizadoEn: '2026-10-17T15:20:00-03:00',
  },
  {
    id: 'lug-008',
    nombre: 'Bodega Vulliez Sermet',
    categoriaId: 'cat-gastronomia',
    descripcionCorta: 'Bodega viñedo pionera en el renacimiento vitivinícola entrerriano.',
    descripcion:
      'Ofrece visitas guiadas explicativas por sus plantaciones de vides, su planta de producción artesanal, la cava subterránea de barricas de roble y degustaciones de cortes finos combinados con picadas de la región.',
    coordenadas: { 
      latitud: -32.203641, 
      longitud: -58.169123 
    },
    direccion: 'Ruta Internacional 135, Km 8, Colón',
    imagenes: [
      'https://media-cdn.tripadvisor.com/media/photo-s/0d/80/17/5a/vinedo.jpg', 
    ],
    horarios: [
      { dia: 1, abre: '10:00', cierra: '17:00' },
      { dia: 2, abre: '10:00', cierra: '17:00' },
      { dia: 3, abre: '10:00', cierra: '17:00' },
      { dia: 4, abre: '10:00', cierra: '17:00' },
      { dia: 5, abre: '10:00', cierra: '17:00' },
      { dia: 6, abre: '10:00', cierra: '13:00' }, 
      { dia: 0, abre: '10:00', cierra: '13:00' },
    ],
    telefono: '3447-423472',
    sitioWeb: 'https://vulliezsermet.com.ar',
    precioEntrada: 4000,
    audioguia: null,
    codigoQr: 'COLON:lug-008',
    accesible: true,
    activo: true,
    actualizadoEn: '2026-10-17T15:20:00-03:00',
  },
  {
    id: 'lug-009',
    nombre: 'Feria de Artesanos del Puerto',
    categoriaId: 'cat-artesanias',
    descripcionCorta: 'Puestos artesanales permanentes frente al río con manufactura local.',
    descripcion:
      'Paseo cultural de la fisonomía ribereña donde artesanos y manualistas exponen piezas de autor auténticas en madera, cuero, metales, textiles y cerámica autóctona. Un recorrido imperdible para las noches de verano.',
    coordenadas: { 
      latitud: -32.222452, 
      longitud: -58.131718 
    },
    direccion: 'Av. Costanera Quirós y Gouchon, Colón',
    imagenes: [
      'https://gualeguaychu.gov.ar/apps/dashboard/ftp/web/images/landscape_h__Gualeguaychu_1612412051.jpg', 
    ],
    horarios: [
      { dia: 1, abre: '17:00', cierra: '23:00' }, // Horario real de noche para responder a la consulta del pliego
      { dia: 2, abre: '17:00', cierra: '23:00' },
      { dia: 3, abre: '17:00', cierra: '23:00' },
      { dia: 4, abre: '17:00', cierra: '23:00' },
      { dia: 5, abre: '16:00', cierra: '00:00' },
      { dia: 6, abre: '16:00', cierra: '00:00' },
      { dia: 0, abre: '16:00', cierra: '00:00' },
    ],
    telefono: null,
    sitioWeb: 'https://colonturismo.tur.ar',
    precioEntrada: 0,
    audioguia: null,
    codigoQr: 'COLON:lug-009',
    accesible: true,
    activo: true,
    actualizadoEn: '2026-10-17T15:20:00-03:00',
  },

   {
    id: 'lug-010',
    nombre: 'MRU Colon Aparts',
    categoriaId: 'cat-alojamiento',
    descripcionCorta: 'Departamentos modernos y tolalmente equipados a pasos de las termas .',
    descripcion:
      'Complejo de aparts turisticos de categoria que ofrece unidades confortable.',
    coordenadas: { 
      latitud: -32.215570, 
      longitud: -58.136894 
    },
    direccion: 'Esq Batalla de Cepeda y Reibel, Colón',
    imagenes: [
      'https://mru-coln-aparts-3285.entre-rios-hoteles.com/data/Images/1080x700w/16335/1633583/1633583189/image-colon-entre-rios-mru-colon-aparts-brown-1.JPEG', 
    ],
    horarios: [
      { dia: 1, abre: '00:00', cierra: '23:59' }, // Horario real de noche para responder a la consulta del pliego
      { dia: 2, abre: '00:00', cierra: '23:59' },
      { dia: 3, abre: '00:00', cierra: '23:59' },
      { dia: 4, abre: '00:00', cierra: '23:59' },
      { dia: 5, abre: '00:00', cierra: '23:59' },
      { dia: 6, abre: '00:00', cierra: '23:59' },
      { dia: 0, abre: '00:00', cierra: '23:59' },
    ],
    telefono: '3447-428256',
    sitioWeb: 'https://colonturismo.tur.ar',
    precioEntrada: null,
    audioguia: null,
    codigoQr: 'COLON:lug-010',
    accesible: true,
    activo: true,
    actualizadoEn: '2026-10-17T22:45:00-03:00',
  },

   {
    id: 'lug-011',
    nombre: 'Don Hugo Restaurante',
    categoriaId: 'cat-restaurante',
    descripcionCorta: 'Restaurante con terraza frente al río dentro del complejo Costarenas.',
    descripcion:
      'Ubicado en la esquina principal de la costanera, ofrece platos de cocina argentina e internacional con terraza de vista panorámica al Río Uruguay, salones climatizados y espectáculos los fines de semana.',
    coordenadas: {
      latitud: -32.2225,
      longitud: -58.1322,
    },
    direccion: 'Av. Costanera Quirós y 12 de Abril, Colón',
    imagenes: [
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9QMD--Sc_SX0Yp-zWfAbgJ3ra1MGjkUqhD56xKhFYOlKRNDW-TJ3vufhO-RPAF-kkTz74U489EiF9Z7NWVtKeTwMC7_eTButKA2QO6z5KcvhpdOe6on1WgjruZdq1KZY8d8RvWVJxfIjaDP=s680-w680-h510-rw',
    ],
    horarios: [
      { dia: 1, abre: '12:00', cierra: '15:30' },
      { dia: 1, abre: '20:00', cierra: '00:30' },
      { dia: 2, abre: '12:00', cierra: '15:30' },
      { dia: 2, abre: '20:00', cierra: '00:30' },
      { dia: 3, abre: '12:00', cierra: '15:30' },
      { dia: 3, abre: '20:00', cierra: '00:30' },
      { dia: 4, abre: '12:00', cierra: '15:30' },
      { dia: 4, abre: '20:00', cierra: '00:30' },
      { dia: 5, abre: '12:00', cierra: '15:30' },
      { dia: 5, abre: '20:00', cierra: '01:00' },
      { dia: 6, abre: '12:00', cierra: '15:30' },
      { dia: 6, abre: '20:00', cierra: '01:00' },
      { dia: 0, abre: '12:00', cierra: '15:30' },
      { dia: 0, abre: '20:00', cierra: '00:30' },
    ],
    telefono: '3447-439036',
    sitioWeb: null,
    precioEntrada: null,
    audioguia: null,
    codigoQr: 'COLON:lug-011',
    accesible: true,
    activo: true,
    actualizadoEn: '2026-10-22T05:00:00-03:00',
  },
  {
    id: 'lug-012',
    nombre: 'Monumento a los Inmigrantes',
    categoriaId: 'cat-monumento',
    descripcionCorta: 'Monumento histórico en homenaje a las familias fundadoras de la colonia.',
    descripcion:
      'Ubicado en el corazón de la Plaza San Martín, rinde homenaje a los colonos suizos, franceses e italianos que poblaron la región a partir de 1857.',
    coordenadas: {
      latitud: -32.221,
      longitud: -58.134,
    },
    direccion: 'Plaza San Martín, Colón',
    imagenes: [
      'https://media-cdn.tripadvisor.com/media/photo-s/15/3b/47/69/estatua-del-gral-san.jpg',
    ],
    horarios: [
      { dia: 1, abre: '00:00', cierra: '23:59' },
      { dia: 2, abre: '00:00', cierra: '23:59' },
      { dia: 3, abre: '00:00', cierra: '23:59' },
      { dia: 4, abre: '00:00', cierra: '23:59' },
      { dia: 5, abre: '00:00', cierra: '23:59' },
      { dia: 6, abre: '00:00', cierra: '23:59' },
      { dia: 0, abre: '00:00', cierra: '23:59' },
    ],
    telefono: null,
    sitioWeb: 'https://colonturismo.tur.ar',
    precioEntrada: 0,
    audioguia: null,
    codigoQr: 'COLON:lug-012',
    accesible: true,
    activo: true,
    actualizadoEn: '2026-10-22T05:00:00-03:00',
  },
  {
    id: 'lug-013',
    nombre: 'Mirador del Río Uruguay',
    categoriaId: 'cat-mirador',
    descripcionCorta: 'Punto panorámico con vista preferencial al río Uruguay y sus islas.',
    descripcion:
      'Ubicado sobre la barranca de la Costanera Quirós, ofrece postales increíbles del amanecer y una vista panorámica de las islas protegidas del río Uruguay.',
    coordenadas: {
      latitud: -32.2285,
      longitud: -58.1302,
    },
    direccion: 'Av. Costanera Quirós y Balcarce, Colón',
    imagenes: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLcmyZNy-d_-xlwRX7AbN3m0m8ivTPh-BDYR8JDJDF-an-Kt3qiI9moK8te5edWbmjiZpDRlfR3MGfmXV2akrcBmxQGB-f3dKvCgA8A15INk_Ej4YQCVwTyz0qR0hQSPn6DPYy3dAQ=s680-w680-h510-rw',
    ],
    horarios: [
      { dia: 1, abre: '00:00', cierra: '23:59' },
      { dia: 2, abre: '00:00', cierra: '23:59' },
      { dia: 3, abre: '00:00', cierra: '23:59' },
      { dia: 4, abre: '00:00', cierra: '23:59' },
      { dia: 5, abre: '00:00', cierra: '23:59' },
      { dia: 6, abre: '00:00', cierra: '23:59' },
      { dia: 0, abre: '00:00', cierra: '23:59' },
    ],
    telefono: null,
    sitioWeb: 'https://colonturismo.tur.ar',
    precioEntrada: 0,
    audioguia: null,
    codigoQr: 'COLON:lug-013',
    accesible: true,
    activo: true,
    actualizadoEn: '2026-10-22T05:00:00-03:00',
  },
  {
    id: 'lug-014',
    nombre: 'Centro de Informes Turísticos',
    categoriaId: 'cat-otro',
    descripcionCorta: 'Oficina central de atención e información para visitantes y turistas.',
    descripcion:
      'Punto de asistencia al turista donde consultar mapas, folletería, actividades culturales, alojamiento disponible y estado de playas.',
    coordenadas: {
      latitud: -32.2222,
      longitud: -58.1378,
    },
    direccion: 'Av. Costanera y 12 de Abril, Colón',
    imagenes: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/0a/67/5b/caption.jpg?w=1000&h=-1&s=1',
    ],
    horarios: [
      { dia: 1, abre: '08:00', cierra: '20:00' },
      { dia: 2, abre: '08:00', cierra: '20:00' },
      { dia: 3, abre: '08:00', cierra: '20:00' },
      { dia: 4, abre: '08:00', cierra: '20:00' },
      { dia: 5, abre: '08:00', cierra: '21:00' },
      { dia: 6, abre: '08:00', cierra: '21:00' },
      { dia: 0, abre: '08:00', cierra: '21:00' },
    ],
    telefono: '3447-421232',
    sitioWeb: 'https://colonturismo.tur.ar',
    precioEntrada: 0,
    audioguia: null,
    codigoQr: 'COLON:lug-014',
    accesible: true,
    activo: true,
    actualizadoEn: '2026-10-22T05:00:00-03:00',
  },
];
