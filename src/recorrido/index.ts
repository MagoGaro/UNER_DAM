import { hayConexionAhora } from '@/src/hooks/useConexion';
import { usuarioIdActual } from '@/src/sesion';
import { repositorioVisitas, servicioVisitasApi } from '@/src/servicios/visitas';
import { crearRecorrido, type Recorrido } from './almacenRecorrido';
import { borrarFoto, guardarFotoPermanente } from './fotos';

export { LARGO_MAXIMO_NOTA } from './almacenRecorrido';

/** Instancia que usa la app (las dependencias reales). */
export const recorrido: Recorrido = crearRecorrido({
  repo: repositorioVisitas,
  api: servicioVisitasApi,
  usuarioId: () => usuarioIdActual(),
  hayConexion: hayConexionAhora,
  guardarFoto: guardarFotoPermanente,
  borrarFoto,
  ahora: () => new Date(),
});
