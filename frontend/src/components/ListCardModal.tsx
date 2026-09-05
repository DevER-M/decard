"use client";

import { useState } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
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
  const [validationError, setValidationError] = useState<string | null>(null);

  const { execute: executeApprove, pending: approvePending, error: approveError, setError: setApproveError } =
    useTransaction<[bigint], `0x${string}`>(approve);
  const { execute: executeList, pending: listPending, error: listError, setError: setListError } =
    useTransaction<[bigint, bigint], `0x${string}`>(listCard);

  const { isSuccess: approved } = useWaitForTransactionReceipt({
    hash: approvalHash ?? undefined,
  });

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
      // Error surfaced via approveError
    }
  }

  async function handleList() {
    setListError(null);
    const wei = validatePrice();
    if (wei === null) return;

    try {
      await executeList(card.tokenId, wei);
      onListed();
      onClose();
    } catch {
      // Error surfaced via listError
    }
  }

  function clearAllErrors() {
    setValidationError(null);
    setApproveError(null);
    setListError(null);
  }

  const errorMessage = validationError || approveError || listError;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>List {card.metadata?.name ?? `Card #${card.tokenId.toString()}`} for sale</h2>

        <label>
          Price (ETH)
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
          />
       </label>

        <button className="btn btn-primary" onClick={handleApprove} disabled={!!approvePending}>
          {approvePending ? "Approving…" : approved ? "Re-approve marketplace" : "Approve marketplace"}
        </button>

        {approvalHash && !approved && (
          <p className="hint">Waiting for approval confirmation…</p>
        )}

        {approved && (
          <button className="btn btn-primary" onClick={handleList} disabled={!!listPending}>
            {listPending ? "Listing…" : `List for ${price} ETH`}
          </button>
        )}

        {errorMessage && <div className="error">{errorMessage}</div>}

        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
