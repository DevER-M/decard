"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles, Zap } from "lucide-react";
import Nav from "../components/Nav";
import CardGrid from "../components/CardGrid";
import { useCards } from "../hooks/useCards";
import { useGameCard } from "../hooks/useGameCard";
import { useMarketplace } from "../hooks/useMarketplace";
import { useAccount } from "wagmi";
import { getRarity, getType } from "../components/CardItem";
import { RARITY_FILTERS, TYPE_FILTERS } from "../lib/cardOptions";

export default function MarketplacePage() {
  const { address, isConnected } = useAccount();
  const { totalSupply } = useGameCard();
  const { cancelListing } = useMarketplace();
  const queryClient = useQueryClient();
  const cards = useCards(
    useMemo(
      () =>
        Array.from({ length: Number(totalSupply ?? 0) }, (_, i) => ({
          tokenId: BigInt(i + 1),
          includeListing: true,
        })),
      [totalSupply],
    ),
  );

  const [rarityFilter, setRarityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const listings = useMemo(
    () => (cards.data ?? []).filter((c) => c.listing?.active),
    [cards.data],
  );

  const filtered = useMemo(
    () =>
      listings.filter((c) => {
        if (rarityFilter !== "All" && getRarity(c) !== rarityFilter) return false;
        if (typeFilter !== "All" && getType(c) !== typeFilter) return false;
        return true;
      }),
    [listings, rarityFilter, typeFilter],
  );

  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Hero banner */}
        <section className="relative mb-12 sm:mb-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch">
            <div className="md:col-span-3 neo-border bg-neo-secondary neo-shadow-xl p-6 sm:p-10 -rotate-[0.5deg]">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-neo-ink text-neo-bg neo-border border-4 border-neo-ink mb-4 font-black uppercase tracking-widest text-xs rotate-[-2deg]">
                <Zap strokeWidth={3} className="h-4 w-4" fill="white" />
                Sepolia Testnet
              </div>
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
                <span className="block">Pokémon</span>
                <span className="block -ml-1">
                  <span className="text-neo-bg" style={{ WebkitTextStroke: "2px black" }}>
                    Cards
                  </span>
                </span>
                <span className="block">on Chain.</span>
              </h1>
              <p className="mt-5 max-w-xl font-bold text-base sm:text-lg">
                Mint, list & trade unique 1/1 Pokémon-style cards. Every card
                is an ERC-721 NFT pinned to IPFS.
              </p>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="neo-border bg-neo-accent neo-shadow-lg p-5 rotate-[2deg]">
                <Sparkles strokeWidth={3} className="h-8 w-8" />
                <div className="mt-3 font-black text-3xl uppercase tracking-tighter">
                  1/1
                </div>
                <div className="text-xs font-black uppercase tracking-widest">
                  Every card unique
                </div>
              </div>
              <div className="neo-border bg-neo-muted neo-shadow-lg p-5 -rotate-[2deg]">
                <div className="font-black text-3xl uppercase tracking-tighter">
                  IPFS
                </div>
                <div className="text-xs font-black uppercase tracking-widest">
                  Permanent metadata
                </div>
              </div>
              <div className="neo-border bg-neo-bg neo-shadow-lg p-5 -rotate-[2deg]">
                <div className="font-black text-3xl uppercase tracking-tighter">
                  ETH
                </div>
                <div className="text-xs font-black uppercase tracking-widest">
                  Direct to seller
                </div>
              </div>
              <div className="neo-border bg-neo-ink text-neo-bg neo-shadow-lg p-5 rotate-[2deg]">
                <div className="font-black text-3xl uppercase tracking-tighter">
                  0% fee
                </div>
                <div className="text-xs font-black uppercase tracking-widest">
                  Peer to peer
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="font-black uppercase tracking-widest text-sm">
            Filter
          </div>
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="neo-border bg-neo-white h-12 px-3 font-black uppercase tracking-widest text-sm focus:bg-neo-secondary focus:outline-none transition-colors"
          >
            <option value="All">All Rarities</option>
            {RARITY_FILTERS.filter((r) => r !== "All").map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="neo-border bg-neo-white h-12 px-3 font-black uppercase tracking-widest text-sm focus:bg-neo-secondary focus:outline-none transition-colors"
          >
            <option value="All">All Types</option>
            {TYPE_FILTERS.filter((t) => t !== "All").map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <div className="flex-1" />
          <div className="inline-flex items-center gap-2 px-3 py-2 neo-border bg-neo-muted/40 font-black uppercase tracking-widest text-xs">
            {filtered.length} {filtered.length === 1 ? "Card" : "Cards"}
          </div>
        </section>

        <CardGrid
          cards={filtered}
          loading={cards.isLoading}
          emptyMessage="No cards currently listed for sale."
          isOwner={(c) =>
            isConnected &&
            (c.ownership?.owner === address || c.listing?.seller === address)
          }
          onCancel={async (tokenId) => {
            try {
              await cancelListing(tokenId);
            } finally {
              queryClient.invalidateQueries({ queryKey: ["cards"] });
            }
          }}
        />
      </main>
    </>
  );
}
