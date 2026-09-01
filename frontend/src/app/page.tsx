"use client";

import { useMemo, useState } from "react";
import Nav from "../components/Nav";
import CardGrid from "../components/CardGrid";
import { useCards } from "../hooks/useCards";
import { useGameCard } from "../hooks/useGameCard";
import { useAccount } from "wagmi";
import { useMarketplace } from "../hooks/useMarketplace";
import { getRarity, getType } from "../components/CardItem";

export default function MarketplacePage() {
  const { address } = useAccount();
  const { totalSupply } = useGameCard();
  const { buyCard } = useMarketplace();
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

  const listings = (cards.data ?? []).filter(
    (c) => c.listing?.active
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
            <option>All</option>
            {["Common", "Uncommon", "Rare", "Legendary", "Mythical"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option>All</option>
            {["Fire", "Water", "Grass", "Electric", "Psychic"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        <CardGrid
          cards={filtered}
          loading={cards.isLoading}
          emptyMessage="No cards currently listed for sale."
          isOwner={(c) => c.ownership?.owner === address}
          onBuy={buyCard}
        />
      </main>
    </>
  );
}
