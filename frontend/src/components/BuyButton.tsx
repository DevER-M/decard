"use client";

import { useState } from "react";
import { useMarketplace } from "../hooks/useMarketplace";
import { toEth } from "./CardItem";

interface BuyButtonProps {
  tokenId: bigint;
  price: bigint; // wei
}

export default function BuyButton({ tokenId, price }: BuyButtonProps) {
  const { buyCard } = useMarketplace();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    setPending(true);
    setError(null);
    try {
      await buyCard(tokenId, price);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button className="btn btn-primary" onClick={handleBuy} disabled={pending}>
        {pending ? "Buying…" : `Buy for ${toEth(price)} ETH`}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
