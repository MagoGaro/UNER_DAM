import { useEffect, useState } from 'react';

/** La hora actual, refrescada cada minuto (para que "finalizado" o "Hoy" se actualicen solos). */
export function useAhora(intervaloMs = 60_000): Date {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);
  return ahora;
}
