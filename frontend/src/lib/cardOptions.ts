import type { Rarity, CardType } from "../types";

/**
 * Canonical list of rarity options for both the mint form dropdown and the
 * marketplace filter dropdown. Sourced from the `Rarity` union type plus any
 * one-off rarities not yet in the union but observed in TCGdex data.
 */
export const RARITIES: Rarity[] = [
  "Common",
  "Uncommon",
  "Rare",
  "Rare Holo",
  "Rare Holo LV.X",
  "Rare Prime",
  "Prime",
  "Rare ACE",
  "Rare BREAK",
  "Rare Prism Star",
  "Amazing Rare",
  "LEGEND",
  "Rare V",
  "Rare VMAX",
  "Rare VSTAR",
  "V",
  "VMAX",
  "VSTAR",
  "GX",
  "Rare GX",
  "ex",
  "Rare ex",
  "M",
  "Promo",
  "Classic",
  "Secret Rare",
  "Rare Secret",
  "Ultra Rare",
  "Rare Ultra",
  "Special Illustration Rare",
  "Illustration Rare",
  "Shiny Rare",
  "Shiny",
];

/** Rarity options prefixed with "All" for filter dropdowns. */
export const RARITY_FILTERS = ["All", ...RARITIES] as const;

/**
 * Canonical list of card type options. Sourced from the `CardType` union type.
 */
export const CARD_TYPES: CardType[] = [
  "Fire",
  "Water",
  "Grass",
  "Electric",
  "Psychic",
  "Fighting",
  "Colorless",
  "Darkness",
  "Metal",
  "Dragon",
  "Fairy",
];

/** Type options prefixed with "All" for filter dropdowns. */
export const TYPE_FILTERS = ["All", ...CARD_TYPES] as const;
