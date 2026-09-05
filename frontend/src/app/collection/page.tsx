"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { Wallet, FolderOpen } from "lucide-react";
import Nav from "../../components/Nav";
import CardGrid from "../../components/CardGrid";
import ListCardModal from "../../components/ListCardModal";
import { useGameCard } from "../../hooks/useGameCard";
import { useCards, type EnrichedCard } from "../../hooks/useCards";
import { useMarketplace } from "../../hooks/useMarketplace";
import { useWriteAndWait } from "../../hooks/useWriteAndWait";

export default function CollectionPage() {
  const { address, isConnected } = useAccount();
  const { ownedTokens, refetchOwned } = useGameCard();
  const { cancelListing } = useMarketplace();
  const { run: cancelListingAndWait } = useWriteAndWait(cancelListing, {
    invalidateOnSuccess: [["cards"]],
  });
  const queryClient = useQueryClient();
  const [listingCard, setListingCard] = useState<EnrichedCard | null>(null);

  const cards = useCards(
    (ownedTokens ?? []).map((tokenId) => ({
      tokenId,
      owner: address,
      includeListing: true,
    })),
  );

  function refresh() {
    refetchOwned();
    queryClient.invalidateQueries({ queryKey: ["cards"] });
  }

  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <section className="mb-10 sm:mb-12">
          <div className="neo-border bg-neo-muted neo-shadow-xl p-6 sm:p-10 rotate-[0.5deg]">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neo-ink text-neo-bg neo-border border-4 border-neo-ink mb-4 font-black uppercase tracking-widest text-xs rotate-[-2deg]">
              <FolderOpen strokeWidth={3} className="h-4 w-4" fill="white" />
              Your wallet
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
              My Collection
            </h1>
            <p className="mt-4 font-bold text-base sm:text-lg max-w-2xl">
              Cards you own. Hover a card to list it for sale or cancel an
              active listing.
            </p>
          </div>
        </section>

        {!isConnected ? (
          <div className="neo-border bg-neo-secondary neo-shadow-lg p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 rotate-[-0.5deg]">
            <span className="inline-flex h-12 w-12 items-center justify-center bg-neo-ink text-neo-bg neo-border">
              <Wallet strokeWidth={3} className="h-6 w-6" />
            </span>
            <div>
              <div className="font-black uppercase tracking-tight text-2xl">
                Wallet not connected
              </div>
              <div className="font-bold text-base">
                Connect your wallet to view your cards.
              </div>
            </div>
          </div>
        ) : (
          <CardGrid
            cards={cards.data ?? []}
            loading={cards.isLoading}
            emptyMessage="You don't own any cards yet. Head over to the Mint page to create one!"
            isOwner={() => true}
            onList={setListingCard}
            onCancel={async (tokenId) => {
              try {
                await cancelListingAndWait(tokenId);
                refresh();
              } catch {
                /* surfaced by hook */
              }
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
