import type { Rarity, CardType } from "../types";

const BASE_URL = "https://api.tcgdex.net/v2";
const LANG = "en";

/**
 * Card-brief shape returned by GET /v2/{lang}/cards (search list).
 * https://tcgdex.dev/reference/card-brief
 */
export interface TCGdexCardBrief {
  id: string;
  localId: string | number;
  name: string;
  image?: string | null;
}

/**
 * Full Card shape returned by GET /v2/{lang}/cards/{id}.
 * https://tcgdex.dev/reference/card
 */
export interface TCGdexCard {
  id: string;
  localId: string | number;
  name: string;
  image?: string | null;
  category: "Pokemon" | "Trainer" | "Energy";
  illustrator?: string;
  rarity?: string;
  set?: {
    id: string;
    name: string;
    logo?: string;
    symbol?: string;
    cardCount?: { official?: number; total?: number };
  };
  variants?: {
    normal?: boolean;
    reverse?: boolean;
    holo?: boolean;
    firstEdition?: boolean;
  };
  hp?: number;
  types?: string[];
  evolveFrom?: string;
  description?: string;
  level?: string;
  stage?: string;
  attacks?: Array<{
    name: string;
    cost?: string[];
    damage?: string | number;
    effect?: string;
  }>;
  weaknesses?: Array<{ type: string; value?: string }>;
  resistances?: Array<{ type: string; value?: string }>;
  retreat?: number;
  dexId?: number[];
  updated?: string;
}

export interface CardSearchParams {
  name?: string;
  id?: string;
  category?: "Pokemon" | "Trainer" | "Energy";
  page?: number;
  itemsPerPage?: number;
}

export interface PaginatedCards {
  data: TCGdexCardBrief[];
  page: number;
  itemsPerPage: number;
}

const RARITY_MAP: Record<string, Rarity> = {
  Common: "Common",
  Uncommon: "Uncommon",
  Rare: "Rare",
  "Rare Holo": "Rare Holo",
  "Rare Holo LV.X": "Rare Holo LV.X",
  "Rare Prime": "Rare Prime",
  "Rare ACE": "Rare ACE",
  "Rare BREAK": "Rare BREAK",
  "Rare Prism Star": "Rare Prism Star",
  "Rare Ultra": "Rare Ultra",
  "Ultra Rare": "Ultra Rare",
  "Rare Secret": "Rare Secret",
  "Secret Rare": "Secret Rare",
  "Special Illustration Rare": "Special Illustration Rare",
  "Illustration Rare": "Illustration Rare",
  "Shiny Rare": "Shiny Rare",
  "Shiny": "Shiny",
  "Promo": "Promo",
  "Classic": "Classic",
  "Amazing Rare": "Amazing Rare",
  "LEGEND": "LEGEND",
  "Rare V": "Rare V",
  "Rare VMAX": "Rare VMAX",
  "Rare VSTAR": "Rare VSTAR",
  V: "V",
  VMAX: "VMAX",
  VSTAR: "VSTAR",
  GX: "GX",
  "Rare GX": "Rare GX",
  ex: "ex",
  "Rare ex": "Rare ex",
  M: "M",
  "Prime": "Prime",
};

export function mapRarity(apiRarity?: string): Rarity {
  if (!apiRarity) return "Common";
  const normalized = apiRarity.trim();
  return RARITY_MAP[normalized] ?? normalized as Rarity;
}

/**
 * TCGdex image URL looks like `https://assets.tcgdex.net/en/<set>/<card>/<localId>`
 * (no extension). Append `/{quality}.{extension}` for the actual file.
 */
export function buildImageUrl(
  imageBase: string | null | undefined,
  quality: "low" | "high" = "low",
  ext: "webp" | "png" | "jpg" = "webp"
): string | null {
  if (!imageBase || imageBase.trim() === "") return null;
  const cleanBase = imageBase.trim();
  if (!cleanBase.startsWith("http")) return null;
  return `${cleanBase}/${quality}.${ext}`;
}

function buildQuery(params: CardSearchParams): string {
  const parts: string[] = [];
  if (params.name) parts.push(`name=${encodeURIComponent(params.name)}`);
  if (params.id) parts.push(`id=${encodeURIComponent(params.id)}`);
  if (params.category) parts.push(`category=${encodeURIComponent(params.category)}`);
  return parts.join("&");
}

/**
 * Search cards. Defaults to `category=Pokemon` (TCGdex returns Trainer + Energy too).
 */
export async function searchCards(params: CardSearchParams): Promise<PaginatedCards> {
  const page = params.page ?? 1;
  const itemsPerPage = params.itemsPerPage ?? 20;
  const qs = buildQuery({ ...params, page: undefined, itemsPerPage: undefined });
  const paginationQs = `pagination:page=${page}&pagination:itemsPerPage=${itemsPerPage}`;
  const url = `${BASE_URL}/${LANG}/cards?${qs ? qs + "&" : ""}${paginationQs}`;

  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`TCGdex API error: ${response.status} ${body}`);
  }
  const data = (await response.json()) as TCGdexCardBrief[];
  return { data, page, itemsPerPage };
}

/** Get full card details by id (e.g. "basep-1"). */
export async function getCardById(id: string): Promise<TCGdexCard | null> {
  if (!id) return null;
  const url = `${BASE_URL}/${LANG}/cards/${encodeURIComponent(id)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return (await response.json()) as TCGdexCard;
  } catch {
    return null;
  }
}

/**
 * Map TCGdex's Pokémon `types` array (e.g. ["Lightning"]) to the CardType.
 * TCGdex uses the canonical Pokémon type names: Grass, Fire, Water, Lightning,
 * Psychic, Fighting, Colorless, Darkness, Metal, Dragon, Fairy.
 */
export function mapType(apiTypes?: string[]): CardType {
  if (!apiTypes || apiTypes.length === 0) return "Fire";
  const typeMap: Record<string, CardType> = {
    Fire: "Fire",
    Water: "Water",
    Grass: "Grass",
    Lightning: "Electric",
    Electric: "Electric",
    Psychic: "Psychic",
    Fighting: "Fighting",
    Colorless: "Colorless",
    Darkness: "Darkness",
    Metal: "Metal",
    Dragon: "Dragon",
    Fairy: "Fairy",
  };
  return typeMap[apiTypes[0]] ?? apiTypes[0] as CardType;
}

export function calculateAttack(card: TCGdexCard): number {
  const atk = card.attacks?.find((a) => a.damage !== undefined && a.damage !== "");
  if (atk && atk.damage !== undefined) {
    const parsed = parseInt(String(atk.damage));
    if (!Number.isNaN(parsed)) return Math.min(parsed, 200);
  }
  return 50;
}

export function calculateDefense(card: TCGdexCard): number {
  if (card.weaknesses && card.weaknesses.length > 0) return 60;
  if (card.resistances && card.resistances.length > 0) return 80;
  return 70;
}

export function calculateHP(card: TCGdexCard): number {
  const hp = card.hp ?? 100;
  return Math.min(typeof hp === "number" ? hp : parseInt(String(hp)) || 100, 500);
}

export function generateDescription(card: TCGdexCard | TCGdexCardBrief): string {
  const parts: string[] = [];
  const full = card as TCGdexCard;
  if (card.name) parts.push(card.name);
  if (full.set?.name) parts.push(`From ${full.set.name}`);
  if (full.stage) parts.push(full.stage);
  if (full.category) parts.push(full.category);
  return parts.join(" — ") || `${card.name} - Pokemon Trading Card Game`;
}
