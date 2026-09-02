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

/**
 * Base URL used to turn `ipfs://...` URIs into HTTP links.
 * Gateway must send CORS headers for browser fetches from the app origin.
 * Pinata's gateway allows CORS; ipfs.io does not, so it is only a fallback.
 */
export const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

/** Background gateways tried when the primary gateway fails. */
const FALLBACK_GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
];

/**
 * Converts an `ipfs://<cid>` URI into a list of HTTP gateway URLs.
 * Pass an already-HTTP string through unchanged as a single-element list.
 */
export function toHttpUrls(uri: string): string[] {
  if (uri.startsWith("http")) return [uri];
  if (uri.startsWith("ipfs://")) {
    const cid = uri.replace("ipfs://", "");
    return [IPFS_GATEWAY, ...FALLBACK_GATEWAYS].map((g) => `${g}${cid}`);
  }
  return [uri];
}

/**
 * Converts an `ipfs://<cid>` URI to the primary HTTP gateway URL.
 * Pass an already-HTTP string through unchanged.
 */
export function toHttpUrl(uri: string): string {
  return toHttpUrls(uri)[0];
}
