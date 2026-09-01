import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { CHAIN } from "./config";

/**
 * Shared wagmi config. Imported by the Providers component and by
 * utilities that need read access to the chain (e.g. reading token URIs).
 */
export const wagmiConfig = createConfig({
  chains: [CHAIN],
  connectors: [injected()],
  transports: {
    [CHAIN.id]: http(),
  },
});
