export const LARGO_MINIMO_PASSWORD = 6;

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarIngreso(datos: { email: string; password: string }): string | null {
  if (!FORMATO_EMAIL.test(datos.email.trim())) return 'Escribí un email válido, por ejemplo nombre@mail.com.';
  if (datos.password.length === 0) return 'Escribí tu contraseña.';
  return null;
}

export function validarRegistro(datos: { nombre: string; email: string; password: string }): string | null {
  if (datos.nombre.trim().length < 2) return 'Escribí tu nombre.';
  if (!FORMATO_EMAIL.test(datos.email.trim())) return 'Escribí un email válido, por ejemplo nombre@mail.com.';
  if (datos.password.length < LARGO_MINIMO_PASSWORD) {
    return `La contraseña tiene que tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`;
  }
  return null;
}
