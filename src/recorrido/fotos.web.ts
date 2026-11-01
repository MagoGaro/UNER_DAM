/** En web no hay sistema de archivos de la app: se guarda la URI tal cual (blob/data URL). */
export function guardarFotoPermanente(uriTemporal: string): string {
  return uriTemporal;
}

export function borrarFoto(): void {}
