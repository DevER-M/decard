import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { CHAIN } from "./config";

/**
 * Shared wagmi config built with RainbowKit.
 * The WalletConnect projectId is used for QR-code wallets; injected wallets
 * (MetaMask etc.) work without it. Configure via NEXT_PUBLIC_WC_PROJECT_ID.
 */
export const wagmiConfig = getDefaultConfig({
  appName: "Decard",
  projectId:
    process.env.NEXT_PUBLIC_WC_PROJECT_ID ||
    "00000000000000000000000000000000",
  chains: [CHAIN],
  transports: {
    [CHAIN.id]: http(),
  },
  ssr: true,
});
