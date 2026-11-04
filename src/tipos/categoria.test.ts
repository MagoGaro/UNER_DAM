import { buscarCategoria } from '@/src/servicios/categorias';
import { iconoCategoria } from './categoria';

describe('iconoCategoria', () => {
  it('conserva el nombre de Ionicons que manda la API', () => {
    expect(iconoCategoria('sunny-outline')).toBe('sunny-outline');
  });

  it('sin ícono usa el pin genérico', () => {
    expect(iconoCategoria(undefined)).toBe('location-outline');
    expect(iconoCategoria('')).toBe('location-outline');
  });
});

describe('buscarCategoria', () => {
  const lista = [
    { id: 'cat-museos', nombre: 'Museos y patrimonio', icono: 'business-outline', color: '#8E5A4A', orden: 3 },
  ];

  it('encuentra la categoría por id de la API', () => {
    expect(buscarCategoria(lista, 'cat-museos')?.nombre).toBe('Museos y patrimonio');
  });

  it('un id que no está en el catálogo no inventa una categoría', () => {
    expect(buscarCategoria(lista, 'cat-otro')).toBeNull();
    expect(buscarCategoria(lista, null)).toBeNull();
  });
});
