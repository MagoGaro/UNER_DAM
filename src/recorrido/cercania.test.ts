import { LUGARES_DE_PRUEBA } from '@/src/servicios/lugares/lugaresDePrueba';
import { lugaresParaRegistrar } from './cercania';

describe('lugaresParaRegistrar', () => {
  it('encuentra el Molino Forclaz estando en la puerta', () => {
    const r = lugaresParaRegistrar({ latitud: -32.1905, longitud: -58.1931 }, LUGARES_DE_PRUEBA);
    expect(r.tipo).toBe('cerca');
    if (r.tipo === 'cerca') expect(r.candidatos[0].lugar.id).toBe('lug-004');
  });

  it('puede devolver varios candidatos en la costanera, ordenados por distancia', () => {
    const r = lugaresParaRegistrar({ latitud: -32.2224, longitud: -58.1320 }, LUGARES_DE_PRUEBA);
    expect(r.tipo).toBe('cerca');
    if (r.tipo === 'cerca') {
      expect(r.candidatos.length).toBeGreaterThan(1);
      const d = r.candidatos.map((c) => c.distanciaMetros);
      expect([...d].sort((a, b) => a - b)).toEqual(d);
    }
  });

  it('lejos de todo informa el más cercano', () => {
    const r = lugaresParaRegistrar({ latitud: -34.6, longitud: -58.38 }, LUGARES_DE_PRUEBA);
    expect(r.tipo).toBe('lejos');
    if (r.tipo === 'lejos') expect(r.masCercano).not.toBeNull();
  });

  it('con catálogo vacío no rompe', () => {
    expect(lugaresParaRegistrar({ latitud: 0, longitud: 0 }, [])).toEqual({ tipo: 'lejos', masCercano: null });
  });
});
