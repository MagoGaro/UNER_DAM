import type { RespuestaApi } from '@/src/tipos/api';
import type { Favorito } from '@/src/tipos/favorito';
import type { ServicioFavoritos } from './ServicioFavoritos';

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Mock en memoria. Lucía (usr-201) arranca con un favorito de ejemplo. */
export class ServicioFavoritosDePrueba implements ServicioFavoritos {
  private readonly datos = new Map<string, Favorito>([
    ['fav-088', { id: 'fav-088', usuarioId: 'usr-201', lugarId: 'lug-004', creadoEn: '2026-11-12T09:05:00-03:00' }],
  ]);
  private contador = 100;

  constructor(private readonly demoraMs = 300) {}

  async listar(usuarioId: string): Promise<RespuestaApi<Favorito[]>> {
    await esperar(this.demoraMs);
    const lista = [...this.datos.values()].filter((f) => f.usuarioId === usuarioId);
    return { datos: lista, meta: { total: lista.length, pagina: 1, porPagina: lista.length || 1 } };
  }

  async agregar(usuarioId: string, lugarId: string): Promise<RespuestaApi<Favorito>> {
    await esperar(this.demoraMs);
    const existente = [...this.datos.values()].find((f) => f.usuarioId === usuarioId && f.lugarId === lugarId);
    if (existente) return { datos: existente, meta: null };
    this.contador += 1;
    const nuevo: Favorito = {
      id: `fav-${this.contador}`,
      usuarioId,
      lugarId,
      creadoEn: new Date().toISOString(),
    };
    this.datos.set(nuevo.id, nuevo);
    return { datos: nuevo, meta: null };
  }

  async quitar(favoritoId: string): Promise<RespuestaApi<null>> {
    await esperar(this.demoraMs / 2);
    this.datos.delete(favoritoId);
    return { datos: null, meta: null };
  }
}
