import { clienteApi } from '@/src/servicios/api';
import type { CategoriaApi } from '@/src/tipos/categoria';
import { ServicioCategoriasApi } from './servicioCategoriasApi';

const servicio = new ServicioCategoriasApi(clienteApi);

let pedido: Promise<CategoriaApi[]> | null = null;

export function listarCategorias(): Promise<CategoriaApi[]> {
  if (!pedido) {
    pedido = servicio.listar().catch((error: unknown) => {
      pedido = null;
      throw error;
    });
  }
  return pedido;
}

export function buscarCategoria(lista: readonly CategoriaApi[], categoriaId: string | null | undefined): CategoriaApi | null {
  if (!categoriaId) return null;
  return lista.find((c) => c.id === categoriaId) ?? null;
}