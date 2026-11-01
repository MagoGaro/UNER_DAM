export interface LecturaMagnetometro {
  x: number;
  y: number;
  z: number;
}

/** Campo magnético terrestre: ~25–65 µT. Fuera de 15–90 hay un imán o un metal cerca y la lectura no sirve. */
const MINIMO_UT = 15;
const MAXIMO_UT = 90;

/**
 * Rumbo (0–360°, 0 = norte magnético, sentido horario) del borde superior
 * del celular, a partir del magnetómetro crudo de `expo-sensors`.
 * Supone el celular casi horizontal, como cuando se mira la flecha
 * caminando; no corrige la inclinación ni usa norte verdadero. Es el
 * respaldo para cuando `watchHeadingAsync` no está disponible.
 */
export function rumboDesdeMagnetometro({ x, y, z }: LecturaMagnetometro): number | null {
  const intensidad = Math.sqrt(x * x + y * y + z * z);
  if (!Number.isFinite(intensidad) || intensidad < MINIMO_UT || intensidad > MAXIMO_UT) return null;
  const grados = (Math.atan2(-x, y) * 180) / Math.PI;
  return (grados + 360) % 360;
}
