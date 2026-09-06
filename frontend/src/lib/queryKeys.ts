export const QUERY_KEYS = {
  CARDS: (inputs: string) => ["cards", inputs] as const,

  POKEMON_CARD_SEARCH: (query: string) => ["pokemon-card-search", query] as const,
  POKEMON_CARD_SEARCH_PAGED: (query: string, page: number) => ["pokemon-card-search-paged", query, page] as const,
  POKEMON_CARD_BY_ID: (cardId: string) => ["pokemon-card", cardId] as const,
};

export type QueryKey<T extends readonly unknown[]> = T;