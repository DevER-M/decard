"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
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
    <div className="flex flex-col gap-2 items-center">
      <button
        className="neo-border bg-neo-accent px-4 py-2 font-black uppercase text-sm tracking-widest neo-press-sm flex items-center gap-2 disabled:opacity-60"
        onClick={handleBuy}
        disabled={pending}
      >
        <ShoppingCart strokeWidth={3} className="h-4 w-4" fill="black" />
        {pending ? "Buying…" : `Buy ${toEth(price)} ETH`}
      </button>
      {error && (
        <div className="neo-border bg-neo-accent text-black font-bold uppercase text-[11px] tracking-widest px-2 py-1 max-w-[240px]">
          {error}
        </div>
      )}
    </div>
  );
}
