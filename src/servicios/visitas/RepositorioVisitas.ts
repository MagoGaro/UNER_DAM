import type { Visita } from '@/src/tipos/visita';

/**
 * Cola/registro local de visitas. Toda visita se guarda primero acá con
 * `sincronizada: false` (frente al molino puede no haber señal) y el
 * sincronizador la sube cuando vuelve la conexión.
 */
export interface RepositorioVisitas {
  listar(): Promise<Visita[]>;
  guardar(visita: Visita): Promise<void>;
  actualizar(id: string, cambios: Partial<Omit<Visita, 'id'>>): Promise<void>;
  eliminar(id: string): Promise<void>;
  pendientes(): Promise<Visita[]>;
}

/** Implementación en memoria (tests). */
export function crearRepositorioEnMemoria(iniciales: Visita[] = []): RepositorioVisitas {
  const datos = new Map(iniciales.map((v) => [v.id, { ...v }]));
  return {
    async listar() {
      return [...datos.values()].sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
    },
    async guardar(v) {
      datos.set(v.id, { ...v });
    },
    async actualizar(id, cambios) {
      const v = datos.get(id);
      if (v) datos.set(id, { ...v, ...cambios });
    },
    async eliminar(id) {
      datos.delete(id);
    },
    async pendientes() {
      return [...datos.values()].filter((v) => !v.sincronizada);
    },
  };
}
