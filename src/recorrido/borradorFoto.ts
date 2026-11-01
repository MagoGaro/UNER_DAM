/**
 * La pantalla de cámara no puede "devolver" un valor al volver atrás, así
 * que deja la foto sacada acá y la pantalla que la pidió la levanta al
 * recuperar el foco. Es memoria nada más: es un pasamanos de segundos.
 */
let fotoPendiente: string | null = null;

export function dejarFoto(uri: string): void {
  fotoPendiente = uri;
}

export function tomarFoto(): string | null {
  const uri = fotoPendiente;
  fotoPendiente = null;
  return uri;
}
