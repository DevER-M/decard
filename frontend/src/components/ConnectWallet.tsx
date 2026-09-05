"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function ConnectWallet() {
  return (
    <div className="neo-press-sm">
      <ConnectButton
        chainStatus="icon"
        accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
        showBalance={false}
      />
    </div>
  );
}
