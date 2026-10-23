import { LUGARES_DE_PRUEBA } from '@/src/servicios/lugares/lugaresDePrueba';
import { obtenerMetadatoCategoria } from './categoria';

describe('obtenerMetadatoCategoria', () => {
  it('reconoce los ids del catálogo en plural', () => {
    expect(obtenerMetadatoCategoria('cat-museos').categoria).toBe('museo');
    expect(obtenerMetadatoCategoria('cat-playas').categoria).toBe('playa');
    expect(obtenerMetadatoCategoria('cat-termas').categoria).toBe('termas');
    expect(obtenerMetadatoCategoria('museo').categoria).toBe('museo');
  });

  it('ningún lugar del catálogo de prueba cae en "Otro" salvo el que lo es', () => {
    const enOtro = LUGARES_DE_PRUEBA.filter((l) => obtenerMetadatoCategoria(l.categoriaId).categoria === 'otro');
    expect(enOtro.map((l) => l.categoriaId)).toEqual(['cat-otro']);
  });

  it('valores raros caen en "Otro" sin romper', () => {
    expect(obtenerMetadatoCategoria(null).categoria).toBe('otro');
    expect(obtenerMetadatoCategoria('cat-inexistente').categoria).toBe('otro');
  });
});
