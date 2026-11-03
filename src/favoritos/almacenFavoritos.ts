import { guardarJSON, leerJSON, type KVStore } from '@/src/almacenamiento/kvStore';
import type { ServicioFavoritos } from '@/src/servicios/favoritos/ServicioFavoritos';
import { esError } from '@/src/tipos/api';
import type { Favorito } from '@/src/tipos/favorito';

export const USUARIO_INVITADO = 'invitado';

export interface InstantaneaFavoritos {
  favoritos: Favorito[];
  sincronizando: boolean;
}

type Pendiente = { tipo: 'agregar'; lugarId: string } | { tipo: 'quitar'; lugarId: string };

const CLAVE_LISTA = 'favoritos.lista';
const CLAVE_PENDIENTES = 'favoritos.pendientes';
const CLAVE_USUARIO = 'favoritos.usuario';

export interface DependenciasFavoritos {
  kv: KVStore;
  servicio: ServicioFavoritos;
  ahora?: () => Date;
}

/**
 * Favoritos guardados primero en el teléfono (un toque, sin señal y sin
 * cuenta) y subidos al servidor cuando hay sesión. Lo que no se pudo
 * subir queda en una cola y se reintenta en la próxima sincronización.
 * Si la persona cierra sesión, se borran del teléfono (siguen en su cuenta).
 */
export class AlmacenFavoritos {
  private estado: InstantaneaFavoritos = { favoritos: [], sincronizando: false };
  private pendientes: Pendiente[] = [];
  private usuarioId: string | null = null;
  private cargado: Promise<void> | null = null;
  private cola: Promise<unknown> = Promise.resolve();
  private readonly oyentes = new Set<() => void>();
  private contador = 0;

  constructor(private readonly deps: DependenciasFavoritos) {}

  obtener = (): InstantaneaFavoritos => this.estado;

  suscribir = (oyente: () => void): (() => void) => {
    this.oyentes.add(oyente);
    return () => {
      this.oyentes.delete(oyente);
    };
  };

  private poner(cambios: Partial<InstantaneaFavoritos>): void {
    this.estado = { ...this.estado, ...cambios };
    this.oyentes.forEach((o) => o());
  }

  private enCola<T>(tarea: () => Promise<T>): Promise<T> {
    const siguiente = this.cola.then(tarea, tarea);
    this.cola = siguiente.catch(() => undefined);
    return siguiente;
  }

  cargar(): Promise<void> {
    if (!this.cargado) {
      this.cargado = (async () => {
        const [lista, pendientes, usuario] = await Promise.all([
          leerJSON<Favorito[]>(this.deps.kv, CLAVE_LISTA, []),
          leerJSON<Pendiente[]>(this.deps.kv, CLAVE_PENDIENTES, []),
          leerJSON<string | null>(this.deps.kv, CLAVE_USUARIO, null),
        ]);
        this.pendientes = pendientes;
        this.usuarioId = usuario;
        this.poner({ favoritos: lista });
      })();
    }
    return this.cargado;
  }

  esFavorito(lugarId: string): boolean {
    return this.estado.favoritos.some((f) => f.lugarId === lugarId);
  }

  private async persistir(): Promise<void> {
    await Promise.all([
      guardarJSON(this.deps.kv, CLAVE_LISTA, this.estado.favoritos),
      guardarJSON(this.deps.kv, CLAVE_PENDIENTES, this.pendientes),
      guardarJSON(this.deps.kv, CLAVE_USUARIO, this.usuarioId),
    ]);
  }

  private ahoraISO(): string {
    return (this.deps.ahora?.() ?? new Date()).toISOString();
  }

  /** Marca o desmarca. Devuelve si quedó como favorito. Nunca lanza. */
  alternar(lugarId: string): Promise<boolean> {
    return this.enCola(async () => {
      await this.cargar();
      const existente = this.estado.favoritos.find((f) => f.lugarId === lugarId);
      if (existente) {
        this.poner({ favoritos: this.estado.favoritos.filter((f) => f.id !== existente.id) });
        const eraPendiente = this.pendientes.some((p) => p.tipo === 'agregar' && p.lugarId === lugarId);
        this.pendientes = this.pendientes.filter((p) => !(p.tipo === 'agregar' && p.lugarId === lugarId));
        if (this.usuarioId && !eraPendiente) {
          await this.quitarEnServidor(existente);
        }
        await this.persistir();
        return false;
      }
      this.contador += 1;
      const nuevo: Favorito = {
        id: `fav-local-${Date.now().toString(36)}${this.contador}`,
        usuarioId: this.usuarioId ?? USUARIO_INVITADO,
        lugarId,
        creadoEn: this.ahoraISO(),
      };
      this.poner({ favoritos: [...this.estado.favoritos, nuevo] });
      if (this.usuarioId) await this.agregarEnServidor(nuevo);
      await this.persistir();
      return true;
    });
  }

  private async agregarEnServidor(local: Favorito): Promise<void> {
    try {
      const r = await this.deps.servicio.agregar(local.usuarioId, local.lugarId);
      if (esError(r)) throw new Error(r.error.codigo);
      this.poner({ favoritos: this.estado.favoritos.map((f) => (f.id === local.id ? r.datos : f)) });
    } catch {
      this.pendientes.push({ tipo: 'agregar', lugarId: local.lugarId });
    }
  }

  private async quitarEnServidor(fav: Favorito): Promise<void> {
    try {
      const r = await this.deps.servicio.quitar(fav.usuarioId, fav.lugarId);
      if (esError(r)) throw new Error(r.error.codigo);
    } catch {
      this.pendientes.push({ tipo: 'quitar', lugarId: fav.lugarId });
    }
  }

  /**
   * Avisa con quién está la app: un id de cuenta, o null sin sesión. Al
   * entrar, los favoritos del invitado pasan a la cuenta; al salir, se borran.
   */
  vincularUsuario(usuarioId: string | null): Promise<void> {
    return this.enCola(async () => {
      await this.cargar();
      if (usuarioId === null) {
        if (this.usuarioId !== null) {
          this.usuarioId = null;
          this.pendientes = [];
          this.poner({ favoritos: [] });
          await this.persistir();
        }
        return;
      }
      if (this.usuarioId !== null && this.usuarioId !== usuarioId) {
        this.pendientes = [];
        this.poner({ favoritos: [] });
      }
      if (this.usuarioId !== usuarioId) {
        const deInvitado = this.estado.favoritos.filter((f) => f.usuarioId === USUARIO_INVITADO);
        this.usuarioId = usuarioId;
        this.poner({
          favoritos: this.estado.favoritos.map((f) => (f.usuarioId === USUARIO_INVITADO ? { ...f, usuarioId } : f)),
        });
        for (const f of deInvitado) {
          if (!this.pendientes.some((p) => p.tipo === 'agregar' && p.lugarId === f.lugarId)) {
            this.pendientes.push({ tipo: 'agregar', lugarId: f.lugarId });
          }
        }
        await this.persistir();
      }
      await this.sincronizarAdentro();
    });
  }

  /** Sube lo pendiente y trae lo de la cuenta. Sin señal no hace nada y se reintenta después. */
  sincronizar(): Promise<void> {
    return this.enCola(async () => {
      await this.cargar();
      await this.sincronizarAdentro();
    });
  }

  private async sincronizarAdentro(): Promise<void> {
    const usuarioId = this.usuarioId;
    if (!usuarioId) return;
    this.poner({ sincronizando: true });
    try {
      const restantes: Pendiente[] = [];
      for (const p of this.pendientes) {
        try {
          if (p.tipo === 'agregar') {
            const r = await this.deps.servicio.agregar(usuarioId, p.lugarId);
            // Un lugar que ya no existe en el servidor no se va a poder guardar nunca: se descarta.
            if (esError(r) && r.error.codigo !== 'LUGAR_NO_ENCONTRADO') throw new Error(r.error.codigo);
          } else {
            const r = await this.deps.servicio.quitar(usuarioId, p.lugarId);
            if (esError(r)) throw new Error(r.error.codigo);
          }
        } catch {
          restantes.push(p);
        }
      }
      this.pendientes = restantes;

      const remoto = await this.deps.servicio.listar(usuarioId);
      if (!esError(remoto)) {
        const aQuitar = new Set(restantes.filter((p) => p.tipo === 'quitar').map((p) => p.lugarId));
        const aAgregar = new Set(restantes.filter((p) => p.tipo === 'agregar').map((p) => p.lugarId));
        const deRemoto = remoto.datos.filter((f) => !aQuitar.has(f.lugarId));
        const locales = this.estado.favoritos.filter(
          (f) => aAgregar.has(f.lugarId) && !deRemoto.some((r) => r.lugarId === f.lugarId)
        );
        this.poner({ favoritos: [...deRemoto, ...locales] });
      }
    } catch {
      // Sin señal: queda todo como está y se reintenta.
    } finally {
      this.poner({ sincronizando: false });
      await this.persistir();
    }
  }
}
