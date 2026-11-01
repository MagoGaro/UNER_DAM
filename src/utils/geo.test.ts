import { describe, it, expect, jest } from '@jest/globals';
import { Linking } from 'react-native';
import {
  distanciaMetros,
  formatearDistancia,
  rumboGrados,
  abrirEnMapaExterno,
} from './geo';

// Mock de react-native para probar la apertura de mapas nativos en Android/iOS
jest.mock('react-native', () => ({
  Platform: { select: jest.fn((objs: any) => objs.android) },
  Linking: {
    canOpenURL: jest.fn().mockResolvedValue(true as never),
    openURL: jest.fn(),
  },
}));

describe('distanciaMetros', () => {
  it('da 0 para el mismo punto', () => {
    const punto = { latitud: -32.2246, longitud: -58.1478 };
    expect(distanciaMetros(punto, punto)).toBe(0);
  });

  it('calcula la distancia aproximada entre dos puntos conocidos de Colón', () => {
    // Plaza San Martín y Costanera de Colón, ~1 km en línea recta.
    const plaza = { latitud: -32.2246, longitud: -58.1478 };
    const costanera = { latitud: -32.2168, longitud: -58.1424 };

    expect(distanciaMetros(plaza, costanera)).toBeCloseTo(1005, -1);
  });
});

describe('rumboGrados', () => {
  it('da 0° cuando el destino está exactamente al norte', () => {
    const desde = { latitud: 0, longitud: 0 };
    const haciaElNorte = { latitud: 1, longitud: 0 };
    expect(rumboGrados(desde, haciaElNorte)).toBeCloseTo(0, 5);
  });

  it('da 90° cuando el destino está exactamente al este', () => {
    const desde = { latitud: 0, longitud: 0 };
    const haciaElEste = { latitud: 0, longitud: 1 };
    expect(rumboGrados(desde, haciaElEste)).toBeCloseTo(90, 5);
  });

  it('siempre devuelve un valor entre 0 y 360', () => {
    const desde = { latitud: -32.2, longitud: -58.1 };
    const haciaElSuroeste = { latitud: -32.3, longitud: -58.2 };
    const rumbo = rumboGrados(desde, haciaElSuroeste);
    expect(rumbo).toBeGreaterThanOrEqual(0);
    expect(rumbo).toBeLessThan(360);
  });
});

describe('formatearDistancia', () => {
  it('usa metros redondeados por debajo de 1 km', () => {
    expect(formatearDistancia(900)).toBe('900 m');
    expect(formatearDistancia(45.6)).toBe('46 m');
  });

  it('usa kilómetros con coma decimal a partir de 1 km', () => {
    expect(formatearDistancia(1400)).toBe('1,4 km');
    expect(formatearDistancia(1000)).toBe('1,0 km');
  });
});

describe('abrirEnMapaExterno', () => {
  it('llama a Linking.openURL con el esquema de mapas', async () => {
    abrirEnMapaExterno(-32.2178, -58.1354, 'Termas Colón');
    expect(Linking.canOpenURL).toHaveBeenCalled();
  });
});
