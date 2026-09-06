"use client";

import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { getPublicClient } from "wagmi/actions";
import { GAME_CARD } from "../lib/contracts";
import { wagmiConfig } from "../lib/wagmi";
import type { CardMetadata } from "../types";
import { toHttpUrls } from "../lib/config";

const METADATA_CACHE = new Map<string, CardMetadata>();

export function useGameCard() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: totalSupply } = useReadContract({
    ...GAME_CARD,
    functionName: "totalSupply",
  });

  const { data: ownedTokens, refetch: refetchOwned } = useReadContract({
    ...GAME_CARD,
    functionName: "tokensOfOwner",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  function mint(metadataURI: string) {
    return writeContractAsync({
      ...GAME_CARD,
      functionName: "mintCard",
      args: [metadataURI],
    });
  }

  return {
    address,
    totalSupply,
    ownedTokens: (ownedTokens as bigint[] | undefined) ?? [],
    mint,
    refetchOwned,
  };
}

export async function readTokenURI(tokenId: bigint): Promise<string | null> {
  const publicClient = getPublicClient(wagmiConfig);
  if (!publicClient) return null;
  try {
    const uri = await publicClient.readContract({
      ...GAME_CARD,
      functionName: "tokenURI",
      args: [tokenId],
    });
    return uri as string;
  } catch {
    return null;
  }
}

export async function fetchCardMetadata(uri: string, useCache = true): Promise<CardMetadata | null> {
  if (!uri) return null;
  
  if (useCache) {
    const cached = METADATA_CACHE.get(uri);
    if (cached) return cached;
  }
  
  const sources = toHttpUrls(uri);
  for (const url of sources) {
    try {
      const res = await fetch(url, { cache: "force-cache" });
      if (res.ok) {
        const data = (await res.json()) as CardMetadata;
        if (useCache) METADATA_CACHE.set(uri, data);
        return data;
      }
    } catch {
      continue;
    }
  }
  return null;
}
