"use client";

import { useMemo, useState } from "react";
import Nav from "../components/Nav";
import CardGrid from "../components/CardGrid";
import { useCards } from "../hooks/useCards";
import { useGameCard } from "../hooks/useGameCard";
import { useMarketplace } from "../hooks/useMarketplace";
import { useWriteAndWait } from "../hooks/useWriteAndWait";
import { useAccount } from "wagmi";
import { getRarity, getType } from "../components/CardItem";
import { RARITY_FILTERS, TYPE_FILTERS } from "../lib/cardOptions";

export default function MarketplacePage() {
  const { address, isConnected } = useAccount();
  const { totalSupply } = useGameCard();
  const { cancelListing } = useMarketplace();
  const { run: cancelListingAndWait } = useWriteAndWait(cancelListing, {
    invalidateOnSuccess: [["cards"]],
  });
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero banner */}
        <section className="mb-10 sm:mb-12">
          <div className="neo-border bg-neo-secondary neo-shadow-xl p-6 sm:p-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neo-ink text-neo-bg neo-border border-4 border-neo-ink mb-4 font-black uppercase tracking-widest text-xs">
              Sepolia
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight">
              Decard
            </h1>
            <p className="mt-3 max-w-xl mx-auto font-bold text-base sm:text-lg">
              Mint, list, and trade unique Pokémon-style cards on Ethereum.
              Each card is an ERC-721 NFT stored on IPFS.
            </p>
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
          <div className="neo-border bg-neo-ink text-neo-bg font-black uppercase tracking-widest text-xs px-3 py-1">
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
              await cancelListingAndWait(tokenId);
            } catch {
              /* surfaced by hook */
            }
          }}
        />
      </main>
    </>
  );
}
