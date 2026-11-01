import * as LocalAuthentication from 'expo-local-authentication';

/** Reingreso con huella o rostro. Si el teléfono no tiene, la app pide la contraseña. */
export interface Biometria {
  disponible(): Promise<boolean>;
  autenticar(motivo: string): Promise<boolean>;
}

export const biometriaDelTelefono: Biometria = {
  async disponible() {
    try {
      const [hardware, inscripta] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);
      return hardware && inscripta;
    } catch {
      return false;
    }
  },
  async autenticar(motivo) {
    try {
      const r = await LocalAuthentication.authenticateAsync({
        promptMessage: motivo,
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });
      return r.success;
    } catch {
      return false;
    }
  },
};

export function crearBiometriaDePrueba(disponible: boolean, acepta = true): Biometria {
  return {
    async disponible() {
      return disponible;
    },
    async autenticar() {
      return acepta;
    },
  };
}
