interface Suscripcion {
  remove(): void;
}

/**
 * Cancela una suscripción nativa (ubicación, brújula) sin que un fallo al
 * desuscribir tire abajo el desmontaje del componente. Algunas
 * plataformas (por ejemplo la brújula en un navegador de escritorio, sin
 * sensor real) dejan la suscripción en un estado del que no se puede
 * desuscribir limpiamente.
 */
export function removerSuscripcionConSeguridad(suscripcion: Suscripcion): void {
  try {
    suscripcion.remove();
  } catch {
    // Ignorado a propósito: ver comentario arriba.
  }
}
