import { useEffect, useMemo, useState } from "react";

export function useErrorBoundary<E extends Error = Error>(): {
  showBoundary: (error: E) => void;
} {
  const [error, setError] = useState<E | null>(null);
  const [shouldThrow, setShouldThrow] = useState<boolean>(false);

  useEffect(() => {
    if (error) setShouldThrow(true);
  }, [error]);

  if (shouldThrow && error) throw error;

  return useMemo(
    () => ({
      showBoundary(nextError: E) {
        setShouldThrow(false);
        setError(nextError);
      },
    }),
    [],
  );
}
