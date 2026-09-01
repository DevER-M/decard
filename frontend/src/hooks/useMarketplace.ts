"use client";

import { useWriteContract, useAccount } from "wagmi";
import { getPublicClient } from "wagmi/actions";
import { GAME_CARD, MARKETPLACE } from "../lib/contracts";
import { wagmiConfig } from "../lib/wagmi";
import type { Listing } from "../types";

/**
 * Wrapper around the Marketplace contract: list, buy, cancel, and read getListing.
 * Also wraps the GameCard approve call needed before listing.
 */
export function useMarketplace() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  /** Approve the marketplace to transfer a card (required before listing). */
  function approve(tokenId: bigint) {
    return writeContractAsync({
      ...GAME_CARD,
      functionName: "approve",
      args: [MARKETPLACE.address, tokenId],
    });
  }

  function listCard(tokenId: bigint, price: bigint) {
    return writeContractAsync({
      ...MARKETPLACE,
      functionName: "listCard",
      args: [GAME_CARD.address, tokenId, price],
    });
  }

  function buyCard(tokenId: bigint, value: bigint) {
    return writeContractAsync({
      ...MARKETPLACE,
      functionName: "buyCard",
      args: [GAME_CARD.address, tokenId],
      value,
    });
  }

  function cancelListing(tokenId: bigint) {
    return writeContractAsync({
      ...MARKETPLACE,
      functionName: "cancelListing",
      args: [GAME_CARD.address, tokenId],
    });
  }

  return {
    address,
    approve,
    listCard,
    buyCard,
    cancelListing,
  };
}

/** Read a listing via the public client (for dynamic/iteration reads). */
export async function readListing(tokenId: bigint): Promise<Listing | null> {
  const publicClient = getPublicClient(wagmiConfig);
  if (!publicClient) return null;
  try {
    const result = await publicClient.readContract({
      ...MARKETPLACE,
      functionName: "getListing",
      args: [GAME_CARD.address, tokenId],
    });
    const [seller, price, active] = result as [string, bigint, boolean];
    return { seller: seller as `0x${string}`, price, active };
  } catch {
    return null;
  }
}
