"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMarketplace } from "../hooks/useMarketplace";
import { toEth } from "../lib/format";

interface BuyButtonProps {
  tokenId: bigint;
  price: bigint;
}

export default function BuyButton({ tokenId, price }: BuyButtonProps) {
  const { buyCard } = useMarketplace();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    setPending(true);
    setError(null);
    try {
      await buyCard(tokenId, price);
      await queryClient.invalidateQueries({ queryKey: ["cards"] });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button className="btn btn-primary" onClick={handleBuy} disabled={!!pending}>
        {pending ? "Buying…" : `Buy for ${toEth(price)} ETH`}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
