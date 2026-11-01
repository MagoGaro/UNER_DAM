import { rumboDesdeMagnetometro } from './brujula';

describe('rumboDesdeMagnetometro', () => {
  const campo = 40; // µT, un valor normal

  it('norte, este, sur y oeste (celular horizontal)', () => {
    expect(rumboDesdeMagnetometro({ x: 0, y: campo, z: 0 })).toBeCloseTo(0);
    expect(rumboDesdeMagnetometro({ x: -campo, y: 0, z: 0 })).toBeCloseTo(90);
    expect(rumboDesdeMagnetometro({ x: 0, y: -campo, z: 0 })).toBeCloseTo(180);
    expect(rumboDesdeMagnetometro({ x: campo, y: 0, z: 0 })).toBeCloseTo(270);
  });

  it('siempre devuelve entre 0 y 360', () => {
    for (let a = 0; a < 360; a += 15) {
      const r = (a * Math.PI) / 180;
      const rumbo = rumboDesdeMagnetometro({ x: -campo * Math.sin(r), y: campo * Math.cos(r), z: -20 });
      expect(rumbo).not.toBeNull();
      expect(rumbo!).toBeGreaterThanOrEqual(0);
      expect(rumbo!).toBeLessThan(360);
      expect(rumbo!).toBeCloseTo(a % 360, 5);
    }
  });

  it('descarta lecturas imposibles: sin señal del sensor o con un imán cerca', () => {
    expect(rumboDesdeMagnetometro({ x: 0, y: 0, z: 0 })).toBeNull();
    expect(rumboDesdeMagnetometro({ x: 500, y: 0, z: 0 })).toBeNull();
    expect(rumboDesdeMagnetometro({ x: Number.NaN, y: 1, z: 1 })).toBeNull();
  });
});
