"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
      [totalSupply]
    )
  );

  const [rarityFilter, setRarityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const listings = useMemo(
    () => (cards.data ?? []).filter((c) => c.listing?.active),
    [cards.data]
  );

  const filtered = useMemo(
    () =>
      listings.filter((c) => {
        if (rarityFilter !== "All" && getRarity(c) !== rarityFilter) return false;
        if (typeFilter !== "All" && getType(c) !== typeFilter) return false;
        return true;
      }),
    [listings, rarityFilter, typeFilter]
  );

  return (
    <>
      <Nav />
      <main className="container">
        <h1 className="page-title">Marketplace</h1>

        <div className="filters">
          <select value={rarityFilter} onChange={(e) => setRarityFilter(e.target.value)}>
            <option value="All">All Rarities</option>
            {RARITY_FILTERS.filter((r) => r !== "All").map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            {TYPE_FILTERS.filter((t) => t !== "All").map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

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
