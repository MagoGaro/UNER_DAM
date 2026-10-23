/**
 * Formato propuesto para los QR que va a reimprimir la Municipalidad
 * (pendiente de confirmar con Valeria): el texto `COLON:<idDelLugar>`,
 * que es exactamente el campo `codigoQr` del catálogo (ej. "COLON:lug-004").
 * También se aceptan URLs que terminen en `/qr/COLON:lug-004` o con
 * `?qr=COLON:lug-004`, por si deciden que el QR abra una página web.
 *
 * Regla del pedido: si alguien escanea un QR que no es nuestro, o uno
 * roto, la app no se rompe ni queda colgada. Esta función nunca tira.
 */
export const PREFIJO_QR = 'COLON:';
const LARGO_MAXIMO = 512;
const PATRON_ID = /^lug-[a-z0-9-]{1,40}$/i;

export type ResultadoQr =
  | { tipo: 'valido'; codigo: string; lugarId: string }
  | { tipo: 'ajeno'; mensaje: string }
  | { tipo: 'roto'; mensaje: string };

const AJENO = 'Este código QR no es de Mi Ciudad Colón. Buscá el cartel con el logo de la Municipalidad.';
const ROTO = 'No pudimos leer bien el código. Acercate un poco más o probá con más luz.';

function extraerDeUrl(texto: string): string | null {
  try {
    const url = new URL(texto);
    const param = url.searchParams.get('qr');
    if (param) return decodeURIComponent(param);
    const partes = decodeURIComponent(url.pathname).split('/').filter(Boolean);
    const ultimo = partes.at(-1);
    return ultimo ?? null;
  } catch {
    return null;
  }
}

export function interpretarCodigoQr(textoCrudo: unknown): ResultadoQr {
  if (typeof textoCrudo !== 'string') return { tipo: 'roto', mensaje: ROTO };
  const texto = textoCrudo.trim();
  if (texto.length === 0 || texto.length > LARGO_MAXIMO) return { tipo: 'roto', mensaje: ROTO };

  let candidato = texto;
  if (/^https?:\/\//i.test(texto)) {
    const desdeUrl = extraerDeUrl(texto);
    if (!desdeUrl) return { tipo: 'ajeno', mensaje: AJENO };
    candidato = desdeUrl.trim();
  }

  if (!candidato.toUpperCase().startsWith(PREFIJO_QR)) return { tipo: 'ajeno', mensaje: AJENO };

  const lugarId = candidato.slice(PREFIJO_QR.length).trim().toLowerCase();
  if (!PATRON_ID.test(lugarId)) return { tipo: 'roto', mensaje: ROTO };

  return { tipo: 'valido', codigo: `${PREFIJO_QR}${lugarId}`, lugarId };
}
