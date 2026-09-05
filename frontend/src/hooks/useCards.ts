"use client";

import { useQuery } from "@tanstack/react-query";
import { readTokenURI, fetchCardMetadata } from "./useGameCard";
import { readListing } from "./useMarketplace";
import { QUERY_KEYS } from "../lib/queryKeys";

export interface EnrichedCard {
  tokenId: bigint;
  metadata: Awaited<ReturnType<typeof fetchCardMetadata>> | null;
  ownership: { tokenId: bigint; owner: `0x${string}` } | null;
  listing: Awaited<ReturnType<typeof readListing>> | null;
}

export interface CardInput {
  tokenId: bigint;
  owner?: `0x${string}`;
  includeListing?: boolean;
}

/**
 * Given a list of token ids (with optional owner + listing lookup),
 * loads each card's IPFS metadata and (optionally) listing state.
 */
export function useCards(inputs: CardInput[]) {
  // Build a stable cache key that encodes the full input shape (per-token
  // owner + includeListing flag) so two queries with the same token ids but
  // different listing flags don't collide in the cache.
  const key = inputs
    .map((i) => `${i.tokenId.toString()}:${i.owner ?? "-"}:${i.includeListing ? "L" : "N"}`)
    .join(",");

  return useQuery({
    queryKey: QUERY_KEYS.CARDS(key),
    queryFn: async (): Promise<EnrichedCard[]> => {
      return Promise.all(
        inputs.map(async (input) => {
          const uri = await readTokenURI(input.tokenId);
          const metadata = uri ? await fetchCardMetadata(uri) : null;
          const listing = input.includeListing ? await readListing(input.tokenId) : null;

          const ownership = input.owner
            ? { tokenId: input.tokenId, owner: input.owner }
            : null;

          return {
            tokenId: input.tokenId,
            metadata,
            ownership,
            listing,
          };
        })
      );
    },
    staleTime: 10_000,
  });
}
