"use client";

import type { EnrichedCard } from "../hooks/useCards";
import CardItem from "./CardItem";

interface CardGridProps {
  cards: EnrichedCard[];
  loading: boolean;
  emptyMessage?: string;
  isOwner: (card: EnrichedCard) => boolean;
  onBuy?: (tokenId: bigint, price: bigint) => void;
  onList?: (card: EnrichedCard) => void;
  onCancel?: (tokenId: bigint) => void;
}

export default function CardGrid({
  cards,
  loading,
  emptyMessage = "No cards to display.",
  isOwner,
  onBuy,
  onList,
  onCancel,
}: CardGridProps) {
  if (loading) {
    return <div className="grid-loading">Loading cards…</div>;
  }

  if (cards.length === 0) {
    return <div className="grid-empty">{emptyMessage}</div>;
  }

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <CardItem
          key={card.tokenId.toString()}
          card={card}
          isOwner={isOwner(card)}
          onBuy={onBuy}
          onList={onList}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}
