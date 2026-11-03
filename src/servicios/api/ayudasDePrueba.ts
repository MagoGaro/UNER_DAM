import { crearCliente, type ClienteApi } from './cliente';

export interface PedidoRegistrado {
  url: string;
  metodo: string;
  encabezados: Record<string, string>;
  cuerpo: string | undefined;
}

type Contestacion = { estado: number; cuerpo?: unknown; texto?: string } | Error;

/** Cliente con un `fetch` falso: contesta lo que se le diga y anota cada pedido. */
export function clienteDePrueba(contestar: (pedido: PedidoRegistrado) => Contestacion, token: string | null = 'tok-1') {
  const pedidos: PedidoRegistrado[] = [];
  const fetchFalso = (async (url: string, init?: RequestInit) => {
    const pedido: PedidoRegistrado = {
      url,
      metodo: init?.method ?? 'GET',
      encabezados: (init?.headers ?? {}) as Record<string, string>,
      cuerpo: typeof init?.body === 'string' ? init.body : undefined,
    };
    pedidos.push(pedido);
    const c = contestar(pedido);
    if (c instanceof Error) throw c;
    const texto = c.texto ?? (c.cuerpo === undefined ? '' : JSON.stringify(c.cuerpo));
    return { status: c.estado, text: async () => texto } as Response;
  }) as unknown as typeof fetch;
  const cliente: ClienteApi = crearCliente({
    urlBase: 'http://api.test:3000/',
    leerToken: async () => token,
    fetch: fetchFalso,
  });
  return { cliente, pedidos };
}

export const ok = <T,>(datos: T, meta: unknown = null) => ({ estado: 200, cuerpo: { datos, meta } });
export const fallo = (estado: number, codigo: string, mensaje = 'mensaje') => ({
  estado,
  cuerpo: { error: { codigo, mensaje } },
});
