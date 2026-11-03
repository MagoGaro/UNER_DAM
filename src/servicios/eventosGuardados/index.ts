import { clienteApi } from '@/src/servicios/api';
import type { ServicioEventosGuardados } from './ServicioEventosGuardados';
import { ServicioEventosGuardadosApi } from './servicioEventosGuardadosApi';

export type { ServicioEventosGuardados } from './ServicioEventosGuardados';

/** Sin API no hay nada que sincronizar: devuelve todo vacío. */
const sinServidor: ServicioEventosGuardados = {
  listar: async () => ({ datos: [], meta: null }),
  guardar: async () => ({ datos: null, meta: null }),
  quitar: async () => ({ datos: null, meta: null }),
};

export const servicioEventosGuardados: ServicioEventosGuardados = clienteApi
  ? new ServicioEventosGuardadosApi(clienteApi)
  : sinServidor;
