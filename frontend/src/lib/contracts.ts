import GameCardNFTJson from "./abis/GameCardNFT.json";
import MarketplaceJson from "./abis/Marketplace.json";
import { GAME_CARD_ADDRESS, MARKETPLACE_ADDRESS } from "./config";

export const GAME_CARD_ABI = GameCardNFTJson;
export const MARKETPLACE_ABI = MarketplaceJson;

export const GAME_CARD = {
  address: GAME_CARD_ADDRESS,
  abi: GAME_CARD_ABI,
} as const;

export const MARKETPLACE = {
  address: MARKETPLACE_ADDRESS,
  abi: MARKETPLACE_ABI,
} as const;
