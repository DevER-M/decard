"use client";

import type { EnrichedCard } from "../hooks/useCards";
import CardItem from "./CardItem";

interface CardGridProps {
  cards: EnrichedCard[];
  loading: boolean;
  emptyMessage?: string;
  isOwner: (card: EnrichedCard) => boolean;
  onList?: (card: EnrichedCard) => void;
  onCancel?: (tokenId: bigint) => void;
}

export default function CardGrid({
  cards,
  loading,
  emptyMessage = "No cards to display.",
  isOwner,
  onList,
  onCancel,
}: CardGridProps) {
  if (loading) {
    return (
      <div className="neo-border bg-neo-muted/40 px-8 py-12 text-center font-black uppercase tracking-widest text-2xl neo-shadow">
        Loading cards…
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="neo-border bg-neo-white px-8 py-12 text-center font-black uppercase tracking-widest text-xl neo-shadow">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 sm:gap-12 pt-6 pb-8 px-2">
      {cards.map((card) => (
        <CardItem
          key={card.tokenId.toString()}
          card={card}
          isOwner={isOwner(card)}
          onList={onList}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}
