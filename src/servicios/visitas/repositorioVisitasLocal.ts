import * as SQLite from 'expo-sqlite';

import type { OrigenVisita, Visita } from '@/src/tipos/visita';
import type { RepositorioVisitas } from './RepositorioVisitas';

/**
 * Repositorio de visitas sobre expo-sqlite (Android / iOS). La tabla
 * respeta 1 a 1 el tipo `Visita`; `sincronizada` se guarda como 0/1.
 */
interface FilaVisita {
  id: string;
  usuarioId: string;
  lugarId: string;
  fechaHora: string;
  origen: string;
  fotoUri: string | null;
  nota: string | null;
  sincronizada: number;
}

const VERSION_ESQUEMA = 1;
let baseDeDatos: Promise<SQLite.SQLiteDatabase> | null = null;

function abrir(): Promise<SQLite.SQLiteDatabase> {
  if (!baseDeDatos) {
    baseDeDatos = (async () => {
      const db = await SQLite.openDatabaseAsync('mi-ciudad.db');
      const fila = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
      if ((fila?.user_version ?? 0) < VERSION_ESQUEMA) {
        await db.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS visitas (
            id TEXT PRIMARY KEY NOT NULL,
            usuarioId TEXT NOT NULL,
            lugarId TEXT NOT NULL,
            fechaHora TEXT NOT NULL,
            origen TEXT NOT NULL,
            fotoUri TEXT,
            nota TEXT,
            sincronizada INTEGER NOT NULL DEFAULT 0
          );
          CREATE INDEX IF NOT EXISTS visitas_pendientes ON visitas (sincronizada);
          PRAGMA user_version = ${VERSION_ESQUEMA};
        `);
      }
      return db;
    })().catch((e) => {
      baseDeDatos = null; // que el próximo intento vuelva a probar
      throw e;
    });
  }
  return baseDeDatos;
}

const ORIGENES: readonly OrigenVisita[] = ['qr', 'gps', 'manual'];

function aVisita(f: FilaVisita): Visita {
  return {
    id: f.id,
    usuarioId: f.usuarioId,
    lugarId: f.lugarId,
    fechaHora: f.fechaHora,
    origen: (ORIGENES as readonly string[]).includes(f.origen) ? (f.origen as OrigenVisita) : 'manual',
    fotoUri: f.fotoUri,
    nota: f.nota,
    sincronizada: f.sincronizada === 1,
  };
}

const COLUMNAS: (keyof Omit<Visita, 'id'>)[] = ['usuarioId', 'lugarId', 'fechaHora', 'origen', 'fotoUri', 'nota', 'sincronizada'];

export const repositorioVisitas: RepositorioVisitas = {
  async listar() {
    const db = await abrir();
    const filas = await db.getAllAsync<FilaVisita>('SELECT * FROM visitas ORDER BY fechaHora ASC');
    return filas.map(aVisita);
  },

  async guardar(v) {
    const db = await abrir();
    await db.runAsync(
      `INSERT OR REPLACE INTO visitas (id, usuarioId, lugarId, fechaHora, origen, fotoUri, nota, sincronizada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [v.id, v.usuarioId, v.lugarId, v.fechaHora, v.origen, v.fotoUri, v.nota, v.sincronizada ? 1 : 0]
    );
  },

  async actualizar(id, cambios) {
    const claves = COLUMNAS.filter((c) => c in cambios);
    if (claves.length === 0) return;
    const db = await abrir();
    const valores = claves.map((c) => {
      const valor = cambios[c];
      if (c === 'sincronizada') return valor ? 1 : 0;
      return (valor ?? null) as string | null;
    });
    await db.runAsync(`UPDATE visitas SET ${claves.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`, [...valores, id]);
  },

  async eliminar(id) {
    const db = await abrir();
    await db.runAsync('DELETE FROM visitas WHERE id = ?', [id]);
  },

  async pendientes() {
    const db = await abrir();
    const filas = await db.getAllAsync<FilaVisita>('SELECT * FROM visitas WHERE sincronizada = 0 ORDER BY fechaHora ASC');
    return filas.map(aVisita);
  },
};
