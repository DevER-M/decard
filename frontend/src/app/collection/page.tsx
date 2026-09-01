"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import Nav from "../../components/Nav";
import CardGrid from "../../components/CardGrid";
import ListCardModal from "../../components/ListCardModal";
import { useGameCard } from "../../hooks/useGameCard";
import { useCards, type EnrichedCard } from "../../hooks/useCards";
import { useMarketplace } from "../../hooks/useMarketplace";
import { useQueryClient } from "@tanstack/react-query";

export default function CollectionPage() {
  const { address, isConnected } = useAccount();
  const { ownedTokens, refetchOwned } = useGameCard();
  const { cancelListing } = useMarketplace();
  const queryClient = useQueryClient();
  const [listingCard, setListingCard] = useState<EnrichedCard | null>(null);

  const cards = useCards(
    (ownedTokens ?? []).map((tokenId) => ({ tokenId, owner: address, includeListing: true }))
  );

  function refresh() {
    refetchOwned();
    queryClient.invalidateQueries({ queryKey: ["cards"] });
  }

  return (
    <>
      <Nav />
      <main className="container">
        <h1 className="page-title">My Collection</h1>
        {!isConnected ? (
          <p className="notice">Connect your wallet to view your cards.</p>
        ) : (
          <CardGrid
            cards={cards.data ?? []}
            loading={cards.isLoading}
            emptyMessage="You don't own any cards yet. Head over to the Mint page to create one!"
            isOwner={() => true}
            onList={setListingCard}
            onCancel={async (tokenId) => {
              await cancelListing(tokenId);
              refresh();
            }}
          />
        )}
      </main>

      {listingCard && (
        <ListCardModal
          card={listingCard}
          onClose={() => setListingCard(null)}
          onListed={refresh}
        />
      )}
    </>
  );
}
