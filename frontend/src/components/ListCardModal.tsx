"use client";

import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { X, Tag } from "lucide-react";
import { useTransaction } from "../hooks/useTransaction";
import type { EnrichedCard } from "../hooks/useCards";
import { useMarketplace } from "../hooks/useMarketplace";

interface ListCardModalProps {
  card: EnrichedCard;
  onClose: () => void;
  onListed: () => void;
}

export default function ListCardModal({ card, onClose, onListed }: ListCardModalProps) {
  const { approve, listCard } = useMarketplace();
  const [price, setPrice] = useState("");
  const [approvalHash, setApprovalHash] = useState<`0x${string}` | null>(null);
  const [listHash, setListHash] = useState<`0x${string}` | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    execute: executeApprove,
    pending: approvePending,
    error: approveError,
    setError: setApproveError,
  } = useTransaction<[bigint], `0x${string}`>(approve);
  const {
    execute: executeList,
    pending: listSubmitPending,
    error: listSubmitError,
    setError: setListError,
  } = useTransaction<[bigint, bigint], `0x${string}`>(listCard);

  const { isSuccess: approved } = useWaitForTransactionReceipt({
    hash: approvalHash ?? undefined,
  });
  const {
    isLoading: waitingForListReceipt,
    isSuccess: listConfirmed,
    isError: listReceiptFailed,
    error: listReceiptErrorObj,
  } = useWaitForTransactionReceipt({ hash: listHash ?? undefined });

  useEffect(() => {
    if (!listConfirmed) return;
    setListHash(null);
    onListed();
    onClose();
  }, [listConfirmed, onListed, onClose]);

  function validatePrice(): bigint | null {
    setValidationError(null);
    const trimmed = price.trim();
    if (!trimmed) {
      setValidationError("Enter a valid price in ETH.");
      return null;
    }
    const num = Number(trimmed);
    if (!Number.isFinite(num) || num <= 0) {
      setValidationError("Price must be greater than 0 ETH.");
      return null;
    }
    try {
      return parseEther(trimmed);
    } catch {
      setValidationError(
        "Invalid price format. Use a decimal value with at most 18 fractional digits (e.g. 0.5).",
      );
      return null;
    }
  }

  async function handleApprove() {
    if (validatePrice() === null) return;
    setApprovalHash(null);
    setApproveError(null);
    setListError(null);
    try {
      const hash = await executeApprove(card.tokenId);
      setApprovalHash(hash);
    } catch {
      // surfaced via approveError
    }
  }

  async function handleList() {
    setListError(null);
    setListHash(null);
    const wei = validatePrice();
    if (wei === null) return;
    try {
      const hash = await executeList(card.tokenId, wei);
      setListHash(hash);
    } catch {
      // surfaced via listSubmitError
    }
  }

  function clearAllErrors() {
    setValidationError(null);
    setApproveError(null);
    setListError(null);
  }

  const listPending = listSubmitPending || waitingForListReceipt;
  const listError =
    listSubmitError ??
    (listReceiptFailed
      ? (listReceiptErrorObj as Error | null)?.message ?? "Transaction failed"
      : null);
  const errorMessage = validationError || approveError || listError;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-neo-bg neo-border neo-shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute -top-4 -right-4 h-10 w-10 neo-border bg-neo-accent neo-press-sm flex items-center justify-center"
          onClick={onClose}
          aria-label="Close"
        >
          <X strokeWidth={3} className="h-5 w-5" />
        </button>

        <div className="bg-neo-secondary neo-border border-b-4 border-black px-6 py-4 flex items-center gap-3">
          <Tag strokeWidth={3} className="h-6 w-6" fill="black" />
          <h2 className="text-2xl font-black uppercase tracking-tight">
            List for Sale
          </h2>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="bg-neo-white neo-border px-3 py-2 font-bold uppercase tracking-wide text-sm">
            {card.metadata?.name ?? `Card #${card.tokenId.toString()}`}
          </div>

          <label className="block">
            <span className="block mb-2 font-black uppercase tracking-widest text-sm">
              Price (ETH)
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                clearAllErrors();
              }}
              placeholder="0.5"
              className="neo-border bg-neo-white h-14 px-3 w-full font-black text-xl placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-[4px_4px_0_0_#000] focus:outline-none transition-colors"
            />
          </label>

          <button
            className="neo-border bg-neo-accent h-14 px-4 font-black uppercase tracking-widest text-base neo-press-sm disabled:opacity-60"
            onClick={handleApprove}
            disabled={approvePending}
          >
            {approvePending
              ? "Approving…"
              : approved
                ? "Re-approve marketplace"
                : "Approve marketplace"}
          </button>

          {approvalHash && !approved && (
            <div className="bg-neo-muted neo-border px-3 py-2 font-bold uppercase tracking-wide text-sm">
              Waiting for approval confirmation…
            </div>
          )}

          {approved && (
            <button
              className="neo-border bg-neo-ink text-neo-bg h-14 px-4 font-black uppercase tracking-widest text-base neo-press-sm disabled:opacity-60"
              onClick={handleList}
              disabled={listPending}
            >
              {listSubmitPending
                ? "Confirm in wallet…"
                : waitingForListReceipt
                  ? "Waiting for confirmation…"
                  : `List for ${price || "0"} ETH`}
            </button>
          )}

          {errorMessage && (
            <div className="neo-border bg-neo-accent text-black px-3 py-2 font-bold uppercase tracking-wide text-sm">
              {errorMessage}
            </div>
          )}

          <button
            className="neo-border-2 bg-neo-bg h-10 px-4 font-black uppercase tracking-widest text-xs neo-press-sm self-end"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
