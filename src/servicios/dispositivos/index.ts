import { clienteApi } from '@/src/servicios/api';
import type { ServicioDispositivos } from './ServicioDispositivos';
import { ServicioDispositivosApi } from './servicioDispositivosApi';

export type { PlataformaDispositivo, ServicioDispositivos } from './ServicioDispositivos';

const sinServidor: ServicioDispositivos = {
  registrar: async () => ({ datos: null, meta: null }),
  quitar: async () => ({ datos: null, meta: null }),
};

export const servicioDispositivos: ServicioDispositivos = clienteApi ? new ServicioDispositivosApi(clienteApi) : sinServidor;
