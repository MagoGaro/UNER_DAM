import { elegirFuente, estaIncluidaEnLaApp, nombreArchivoAudioguia } from './audioguias';

describe('nombreArchivoAudioguia', () => {
  it('usa un archivo por lugar e idioma con la extensión de la URL', () => {
    expect(nombreArchivoAudioguia('lug-004', 'es', 'https://api.colon.tur.ar/audio/molino-es.m4a')).toBe('lug-004-es.m4a');
    expect(nombreArchivoAudioguia('lug-010', 'en', 'https://x.ar/a/b.MP3?token=1#t')).toBe('lug-010-en.mp3');
  });

  it('si la URL no tiene una extensión razonable usa m4a', () => {
    expect(nombreArchivoAudioguia('lug-001', 'es', 'https://x.ar/audio/relato')).toBe('lug-001-es.m4a');
    expect(nombreArchivoAudioguia('lug-001', 'es', 'https://x.ar/audio.dominio/relato')).toBe('lug-001-es.m4a');
  });
});

describe('elegirFuente', () => {
  it('lo que viene dentro de la app gana siempre', () => {
    expect(estaIncluidaEnLaApp('lug-004')).toBe(true);
    const f = elegirFuente({ lugarId: 'lug-004', urlRemota: 'https://x/a.m4a', uriLocal: 'file:///a.m4a' });
    expect(typeof f).toBe('number');
  });

  it('prefiere el archivo descargado antes que internet', () => {
    expect(elegirFuente({ lugarId: 'lug-002', urlRemota: 'https://x/a.m4a', uriLocal: 'file:///a.m4a' })).toEqual({ uri: 'file:///a.m4a' });
    expect(elegirFuente({ lugarId: 'lug-002', urlRemota: 'https://x/a.m4a', uriLocal: null })).toEqual({ uri: 'https://x/a.m4a' });
  });

  it('un lugar sin audioguía no tiene fuente', () => {
    expect(elegirFuente({ lugarId: 'lug-002', urlRemota: null, uriLocal: null })).toBeNull();
  });
});
