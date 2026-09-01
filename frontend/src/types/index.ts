export type Rarity = "Common" | "Uncommon" | "Rare" | "Legendary" | "Mythical";

export type CardType = "Fire" | "Water" | "Grass" | "Electric" | "Psychic";

export interface CardAttribute {
  trait_type: string;
  value: string | number;
}

export interface CardMetadata {
  name: string;
  description: string;
  image: string;
  attributes: CardAttribute[];
}

export interface CardData {
  tokenId: bigint;
  metadata: CardMetadata | null;
  owner: `0x${string}`;
}

export interface Listing {
  seller: `0x${string}`;
  price: bigint;
  active: boolean;
}

export interface ListedCard extends CardData {
  listing: Listing;
}
