import type { ClienteApi } from '@/src/servicios/api/cliente';
import { ErrorDeServicio, esError } from '@/src/tipos/api';
import type { Lugar } from '@/src/tipos/lugar';
import type { FiltrosLugares, ServicioLugares } from './ServicioLugares';

/** El catálogo entero entra en una página: el teléfono lo guarda completo (máximo de la API). */
const POR_PAGINA_CATALOGO = 500;

/** El `Lugar` de la API es el del pedido; la tarjeta de «Cerca tuyo» usa además `imagenUrl`. */
function mapearLugar(lugar: Lugar): Lugar {
  return { ...lugar, imagenUrl: lugar.imagenes[0] };
}

/** Catálogo contra la API real (`GET /lugares` y `GET /lugares/:id`). */
export class ServicioLugaresApi implements ServicioLugares {
  constructor(private readonly cliente: ClienteApi) {}

  async listarLugares(filtros?: FiltrosLugares): Promise<readonly Lugar[]> {
    const r = await this.cliente.pedirTodo<Lugar>(
      '/lugares',
      { categoriaId: filtros?.categoriaId, q: filtros?.busqueda },
      { porPagina: POR_PAGINA_CATALOGO }
    );
    if (esError(r)) throw new ErrorDeServicio(r.error.codigo, r.error.mensaje);
    return r.datos.filter((l) => l.activo).map(mapearLugar);
  }

  async obtenerPorId(id: string): Promise<Lugar | null> {
    const r = await this.cliente.pedir<Lugar>({ ruta: `/lugares/${encodeURIComponent(id)}` });
    if (esError(r)) {
      if (r.error.codigo === 'LUGAR_NO_ENCONTRADO' || r.error.codigo === 'RUTA_NO_ENCONTRADA') return null;
      throw new ErrorDeServicio(r.error.codigo, r.error.mensaje);
    }
    return r.datos.activo ? mapearLugar(r.datos) : null;
  }

  async obtenerPorQr(codigo: string): Promise<Lugar | null> {
    const r = await this.cliente.pedir<Lugar>({
      ruta: `/lugares/qr/${encodeURIComponent(codigo)}`,
    });
    if (esError(r)) {
      if (r.error.codigo === 'QR_NO_RECONOCIDO' || r.error.codigo === 'LUGAR_NO_ENCONTRADO') return null;
      throw new ErrorDeServicio(r.error.codigo, r.error.mensaje);
    }
    return r.datos.activo ? mapearLugar(r.datos) : null;
  }
}
