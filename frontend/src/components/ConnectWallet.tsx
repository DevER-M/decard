"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export function formatAddress(address: `0x${string}`) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="wallet">
        <span className="wallet-address" title={address}>
          {formatAddress(address)}
        </span>
        <button className="btn btn-secondary" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="wallet">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          className="btn btn-primary"
          onClick={() => connect({ connector })}
        >
          Connect Wallet
        </button>
      ))}
    </div>
  );
}
