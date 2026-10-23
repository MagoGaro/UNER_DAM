import { interpretarCodigoQr } from './codigoQr';

describe('interpretarCodigoQr', () => {
  it('acepta el formato del catálogo', () => {
    expect(interpretarCodigoQr('COLON:lug-004')).toEqual({ tipo: 'valido', codigo: 'COLON:lug-004', lugarId: 'lug-004' });
  });

  it('tolera espacios y minúsculas', () => {
    const r = interpretarCodigoQr('  colon:LUG-004 \n');
    expect(r.tipo).toBe('valido');
    if (r.tipo === 'valido') expect(r.lugarId).toBe('lug-004');
  });

  it('acepta una URL que lleve el código', () => {
    expect(interpretarCodigoQr('https://turismo.colon.gov.ar/qr/COLON:lug-001').tipo).toBe('valido');
    expect(interpretarCodigoQr('https://turismo.colon.gov.ar/visita?qr=COLON%3Alug-009').tipo).toBe('valido');
  });

  it('rechaza QR de otros (menú de un bar, wifi, link cualquiera) sin romper', () => {
    expect(interpretarCodigoQr('https://www.instagram.com/algun.bar').tipo).toBe('ajeno');
    expect(interpretarCodigoQr('WIFI:S:MiRed;T:WPA;P:1234;;').tipo).toBe('ajeno');
    expect(interpretarCodigoQr('hola').tipo).toBe('ajeno');
  });

  it('marca como roto un código nuestro mal formado, vacío o gigante', () => {
    expect(interpretarCodigoQr('COLON:').tipo).toBe('roto');
    expect(interpretarCodigoQr('COLON:lug-004; DROP TABLE visitas').tipo).toBe('roto');
    expect(interpretarCodigoQr('').tipo).toBe('roto');
    expect(interpretarCodigoQr('x'.repeat(5000)).tipo).toBe('roto');
    expect(interpretarCodigoQr(undefined).tipo).toBe('roto');
    expect(interpretarCodigoQr('https://%%%').tipo).toBe('ajeno');
  });
});
