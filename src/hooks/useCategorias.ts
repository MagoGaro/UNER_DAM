import { useCallback, useEffect, useState } from 'react';

import { listarCategorias } from '@/src/servicios/categorias';
import type { CategoriaApi } from '@/src/tipos/categoria';

export function useCategorias() {
  const [categorias, setCategorias] = useState<CategoriaApi[]>([]);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'error'>('cargando');
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setEstado('cargando');
    listarCategorias()
      .then((lista) => {
        if (cancelado) return;
        setCategorias(lista);
        setEstado('listo');
      })
      .catch(() => {
        if (!cancelado) setEstado('error');
      });
    return () => {
      cancelado = true;
    };
  }, [intento]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);
  return { categorias, estado, reintentar };
}