"use client";

import { useQuery } from "@tanstack/react-query";
import { readTokenURI, fetchCardMetadata } from "./useGameCard";
import { readListing } from "./useMarketplace";

export interface EnrichedCard {
  tokenId: bigint;
  metadata: Awaited<ReturnType<typeof fetchCardMetadata>>;
  ownership: { tokenId: bigint; owner: `0x${string}` } | null;
  listing: Awaited<ReturnType<typeof readListing>>;
}

export interface CardInput {
  tokenId: bigint;
  owner?: `0x${string}`;
  includeListing?: boolean;
}

/**
 * Given a list of token ids (with optional owner + listing lookup),
 * loads each card's IPFS metadata and listing state.
 */
export function useCards(inputs: CardInput[]) {
  const ids = inputs.map((i) => i.tokenId.toString()).join(",");
  const withListing = inputs.every((i) => i.includeListing) ? "L" : "N";

  return useQuery({
    queryKey: ["cards", ids, withListing],
    queryFn: async (): Promise<EnrichedCard[]> => {
      return Promise.all(
        inputs.map(async (input) => {
          const uri = await readTokenURI(input.tokenId);
          const metadata = uri ? await fetchCardMetadata(uri) : null;
          const listing = input.includeListing ? await readListing(input.tokenId) : null;
          return {
            tokenId: input.tokenId,
            metadata,
            ownership: input.owner ? { tokenId: input.tokenId, owner: input.owner } : null,
            listing,
          };
        })
      );
    },
    staleTime: 10_000,
  });
}
