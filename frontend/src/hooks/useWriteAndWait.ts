"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";

interface UseWriteAndWaitOptions {
  invalidateOnSuccess?: ReadonlyArray<readonly unknown[]>;
}

/**
 * Run a contract write and wait for the receipt before resolving.
 *
 * `writeFn` should call `writeContractAsync` (or similar) and return the
 * transaction hash. `run` resolves only after the receipt is mined and
 * rejects on user-rejection or a reverted transaction.
 */
export function useWriteAndWait<TArgs extends unknown[]>(
  writeFn: (...args: TArgs) => Promise<`0x${string}`>,
  options: UseWriteAndWaitOptions = {}
) {
  const { isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [hash, setHash] = useState<`0x${string}` | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    isLoading: waitingForReceipt,
    isSuccess: confirmed,
    isError: receiptFailed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: hash ?? undefined });

  useEffect(() => {
    if (!confirmed || !hash) return;
    setHash(null);
    for (const key of options.invalidateOnSuccess ?? []) {
      queryClient.invalidateQueries({ queryKey: key as readonly unknown[] });
    }
  }, [confirmed, hash, queryClient, options.invalidateOnSuccess]);

  const run = useCallback(
    async (...args: TArgs): Promise<void> => {
      if (!isConnected) {
        const e = new Error("Wallet not connected");
        setSubmitError(e.message);
        throw e;
      }
      setSubmitError(null);
      setHash(null);
      setSubmitting(true);
      try {
        const txHash = await writeFn(...args);
        setHash(txHash);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setSubmitError(message);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [writeFn, isConnected]
  );

  const error =
    submitError ??
    (receiptFailed
      ? (receiptError as Error | null)?.message ?? "Transaction failed"
      : null);

  return {
    run,
    pending: submitting || waitingForReceipt,
    submitting,
    waitingForReceipt,
    error,
    clearError: () => {
      setSubmitError(null);
      setHash(null);
    },
  };
}
