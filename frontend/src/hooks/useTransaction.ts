"use client";

import { useState, useCallback } from "react";

export function useTransaction<TArgs extends unknown[], TResult>(
  asyncFn: (...args: TArgs) => Promise<TResult>
) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: TArgs): Promise<TResult> => {
    setPending(true);
    setError(null);
    try {
      const result = await asyncFn(...args);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setPending(false);
    }
  }, [asyncFn]);

  return {
    execute,
    pending,
    error,
    setError,
    reset: () => {
      setPending(false);
      setError(null);
    },
  };
}