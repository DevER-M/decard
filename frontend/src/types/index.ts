export type Rarity = 
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Rare Holo"
  | "Rare Holo LV.X"
  | "Rare Prime"
  | "Prime"
  | "Rare ACE"
  | "Rare BREAK"
  | "Rare Prism Star"
  | "Rare Ultra"
  | "Ultra Rare"
  | "Rare Secret"
  | "Secret Rare"
  | "Special Illustration Rare"
  | "Illustration Rare"
  | "Shiny Rare"
  | "Shiny"
  | "Promo"
  | "Classic"
  | "Amazing Rare"
  | "LEGEND"
  | "Rare V"
  | "Rare VMAX"
  | "Rare VSTAR"
  | "V"
  | "VMAX"
  | "VSTAR"
  | "GX"
  | "Rare GX"
  | "ex"
  | "Rare ex"
  | "M";

export type CardType = 
  | "Fire"
  | "Water"
  | "Grass"
  | "Electric"
  | "Psychic"
  | "Fighting"
  | "Colorless"
  | "Darkness"
  | "Metal"
  | "Dragon"
  | "Fairy";

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

export interface MappedCardData {
  name: string;
  description: string;
  type: CardType;
  rarity: Rarity;
  attack: number;
  defense: number;
  hp: number;
  imageUri: string;
}
