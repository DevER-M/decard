/**
 * Centralized query keys for React Query to avoid magic strings and ensure consistency.
 */

export const QUERY_KEYS = {
  // Combined card data (metadata + listing, keyed by the encoded inputs shape)
  CARDS: (inputs: string) => ["cards", inputs] as const,

  // Pokemon TCG API queries
  POKEMON_CARD_SEARCH: (query: string) => ["pokemon-card-search", query] as const,
  POKEMON_CARD_BY_ID: (cardId: string) => ["pokemon-card", cardId] as const,
};

/**
 * Type utilities for query keys
 */
export type QueryKey<T extends readonly unknown[]> = T;
