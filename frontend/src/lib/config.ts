import { sepolia } from "viem/chains";

/**
 * Network configuration.
 * Sepolia testnet — funded via https://sepoliafaucet.com or Alchemy faucet.
 */
export const CHAIN = sepolia;

/**
 * Deployed contract addresses (fill these in after running scripts/deploy.py on Sepolia).
 * Placeholders are used below so the app can build before a real deployment exists.
 * Override via:
 *   NEXT_PUBLIC_GAME_CARD_ADDRESS
 *   NEXT_PUBLIC_MARKETPLACE_ADDRESS
 */
export const GAME_CARD_ADDRESS =
  (process.env.NEXT_PUBLIC_GAME_CARD_ADDRESS as `0x${string}` | undefined) ??
  "0x0000000000000000000000000000000000000000";
export const MARKETPLACE_ADDRESS =
  (process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS as `0x${string}` | undefined) ??
  "0x0000000000000000000000000000000000000000";

/** Base URL used to turn `ipfs://...` URIs into HTTP links for display. */
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

/**
 * Converts an `ipfs://<cid>` URI to an HTTP gateway URL.
 * Pass an already-HTTP string through unchanged.
 */
export function toHttpUrl(uri: string): string {
  if (uri.startsWith("http")) return uri;
  if (uri.startsWith("ipfs://")) {
    const cid = uri.replace("ipfs://", "");
    return `${IPFS_GATEWAY}${cid}`;
  }
  return uri;
}
