import type { Lugar } from '@/src/tipos/lugar';
import { lugaresParaRegistrar } from './cercania';

function lugar(id: string, latitud: number, longitud: number): Lugar {
  return {
    id,
    nombre: id,
    categoriaId: 'cat-museos',
    descripcionCorta: 'corto',
    descripcion: 'largo',
    coordenadas: { latitud, longitud },
    direccion: 'Colón',
    imagenes: [],
    horarios: [],
    telefono: null,
    sitioWeb: null,
    precioEntrada: null,
    audioguia: null,
    codigoQr: null,
    accesible: true,
    activo: true,
    actualizadoEn: '2026-08-01T10:30:00-03:00',
  };
}

describe('lugaresParaRegistrar', () => {
  it('encuentra el lugar que está a pocos metros', () => {
    const catalogo = [lugar('lug-004', -32.1904, -58.1932)];
    const r = lugaresParaRegistrar({ latitud: -32.1905, longitud: -58.1931 }, catalogo);
    expect(r.tipo).toBe('cerca');
    if (r.tipo === 'cerca') expect(r.candidatos[0].lugar.id).toBe('lug-004');
  });

  it('puede devolver varios candidatos, ordenados por distancia', () => {
    const catalogo = [
      lugar('lug-b', -32.2232, -58.1326),
      lugar('lug-a', -32.2225, -58.1321),
    ];
    const r = lugaresParaRegistrar({ latitud: -32.2224, longitud: -58.132 }, catalogo);
    expect(r.tipo).toBe('cerca');
    if (r.tipo === 'cerca') {
      expect(r.candidatos.length).toBeGreaterThan(1);
      const d = r.candidatos.map((c) => c.distanciaMetros);
      expect([...d].sort((a, b) => a - b)).toEqual(d);
    }
  });

  it('lejos de todo informa el más cercano', () => {
    const catalogo = [lugar('lug-001', -32.2135, -58.1455)];
    const r = lugaresParaRegistrar({ latitud: -34.6, longitud: -58.38 }, catalogo);
    expect(r.tipo).toBe('lejos');
    if (r.tipo === 'lejos') expect(r.masCercano).not.toBeNull();
  });

  it('con catálogo vacío no rompe', () => {
    expect(lugaresParaRegistrar({ latitud: 0, longitud: 0 }, [])).toEqual({ tipo: 'lejos', masCercano: null });
  });
});
