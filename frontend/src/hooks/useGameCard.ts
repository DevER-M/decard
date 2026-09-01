"use client";

import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { getPublicClient } from "wagmi/actions";
import { GAME_CARD } from "../lib/contracts";
import { wagmiConfig } from "../lib/wagmi";
import type { CardMetadata } from "../types";
import { toHttpUrl } from "../lib/config";

/**
 * Wrapper around the GameCardNFT contract.
 * Provides minting plus read helpers for balance/tokens/metadata.
 */
export function useGameCard() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: balance } = useReadContract({
    ...GAME_CARD,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

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
    balance,
    totalSupply,
    ownedTokens: (ownedTokens as bigint[] | undefined) ?? [],
    mint,
    refetchOwned,
  };
}

/** Read a token's metadata URI using the shared public client. */
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

/** Fetch and parse metadata JSON from an ipfs:// URI. */
export async function fetchCardMetadata(uri: string): Promise<CardMetadata | null> {
  try {
    const res = await fetch(toHttpUrl(uri));
    if (!res.ok) return null;
    return (await res.json()) as CardMetadata;
  } catch {
    return null;
  }
}
