import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { CHAIN } from "./config";

/**
 * Shared wagmi config built with RainbowKit.
 *
 * The WalletConnect connector instantiates Reown AppKit, which calls
 * cloud.reown.com and rejects origins not on the project's Allowlist
 * ("Origin ... not found on Allowlist"). So we only register it when a real
 * project ID is configured in NEXT_PUBLIC_WC_PROJECT_ID; injected wallets
 * (MetaMask extension etc.) work without it and make no cloud calls.
 *
 * Uses the same reliable public Node RPC as the Ape network config; override
 * via NEXT_PUBLIC_RPC_URL (e.g. an Alchemy/Infura key for higher limits).
 */
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

const walletFactories = WC_PROJECT_ID
  ? [walletConnectWallet, metaMaskWallet, injectedWallet]
  : [injectedWallet];

const connectors = connectorsForWallets(
  [
    {
      groupName: "Wallets",
      wallets: walletFactories,
    },
  ],
  {
    appName: "Decard",
    projectId: WC_PROJECT_ID ?? "00000000000000000000000000000000",
  }
);

export const wagmiConfig = createConfig({
  chains: [CHAIN],
  transports: {
    [CHAIN.id]: http(RPC_URL),
  },
  connectors,
  ssr: true,
});