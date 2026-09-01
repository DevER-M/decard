"use client";

import { useState } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wait for the approve transaction to confirm
  const { data: approvalReceipt, isSuccess: approved } = useWaitForTransactionReceipt({
    hash: approvalHash ?? undefined,
  });

  async function handleApprove() {
    setError(null);
    if (!price || Number(price) <= 0) {
      setError("Enter a valid price in ETH.");
      return;
    }
    setPending(true);
    try {
      const hash = await approve(card.tokenId);
      setApprovalHash(hash);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }

  async function handleList() {
    setError(null);
    setPending(true);
    try {
      await listCard(card.tokenId, parseEther(price));
      onListed();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }

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
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.5"
          />
        </label>

        {!approvalHash && (
          <button className="btn btn-primary" onClick={handleApprove} disabled={pending}>
            {pending ? "Approving…" : "Approve marketplace"}
          </button>
        )}

        {approvalHash && !approved && (
          <p className="hint">Waiting for approval confirmation…</p>
        )}

        {approved && (
          <button className="btn btn-primary" onClick={handleList} disabled={pending}>
            {pending ? "Listing…" : `List for ${price} ETH`}
          </button>
        )}

        {error && <div className="error">{error}</div>}

        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
