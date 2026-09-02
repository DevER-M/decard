import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { CHAIN } from "./config";

/**
 * Shared wagmi config built with RainbowKit.
 * The WalletConnect projectId is used for QR-code wallets; injected wallets
 * (MetaMask etc.) work without it. Configure via NEXT_PUBLIC_WC_PROJECT_ID.
 *
 * Uses the same reliable public Node RPC as the Ape network config; override
 * via NEXT_PUBLIC_RPC_URL (e.g. an Alchemy/Infura key for higher limits).
 */
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

export const wagmiConfig = getDefaultConfig({
  appName: "Decard",
  projectId:
    process.env.NEXT_PUBLIC_WC_PROJECT_ID ||
    "00000000000000000000000000000000",
  chains: [CHAIN],
  transports: {
    [CHAIN.id]: http(RPC_URL),
  },
  ssr: true,
});
