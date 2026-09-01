"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function formatAddress(address: `0x${string}`) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ConnectWallet() {
  return <ConnectButton />;
}
