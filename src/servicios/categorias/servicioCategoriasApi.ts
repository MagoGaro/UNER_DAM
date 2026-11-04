import type { ClienteApi } from '@/src/servicios/api/cliente';
import { ErrorDeServicio, esError } from '@/src/tipos/api';
import type { CategoriaApi } from '@/src/tipos/categoria';

export class ServicioCategoriasApi {
  constructor(private readonly cliente: ClienteApi) {}

  async listar(): Promise<CategoriaApi[]> {
    const r = await this.cliente.pedirTodo<CategoriaApi>('/categorias');
    if (esError(r)) throw new ErrorDeServicio(r.error.codigo, r.error.mensaje);
    return [...r.datos].sort((a, b) => a.orden - b.orden);
  }
}