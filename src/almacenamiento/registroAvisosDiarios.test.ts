import { crearKVStoreEnMemoria } from './kvStore';
import { crearRegistroAvisosDiarios } from './registroAvisosDiarios';

describe('registroAvisosDiarios', () => {
  it('no marca un lugar como avisado antes de llamar a marcarAviso', async () => {
    const registro = crearRegistroAvisosDiarios(crearKVStoreEnMemoria());
    expect(await registro.yaAviseHoy('lug-001')).toBe(false);
  });

  it('recuerda que un lugar ya avisó hoy después de marcarAviso', async () => {
    const registro = crearRegistroAvisosDiarios(crearKVStoreEnMemoria());
    await registro.marcarAviso('lug-001');
    expect(await registro.yaAviseHoy('lug-001')).toBe(true);
  });

  it('no confunde avisos de lugares distintos', async () => {
    const registro = crearRegistroAvisosDiarios(crearKVStoreEnMemoria());
    await registro.marcarAviso('lug-001');
    expect(await registro.yaAviseHoy('lug-002')).toBe(false);
  });
});
