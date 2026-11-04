import { clienteApi } from '@/src/servicios/api';
import type { ServicioDispositivos } from './ServicioDispositivos';
import { ServicioDispositivosApi } from './servicioDispositivosApi';

export type { PlataformaDispositivo, ServicioDispositivos } from './ServicioDispositivos';

export const servicioDispositivos: ServicioDispositivos = new ServicioDispositivosApi(clienteApi);
